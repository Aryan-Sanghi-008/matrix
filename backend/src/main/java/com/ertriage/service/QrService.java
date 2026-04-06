package com.ertriage.service;

import com.ertriage.dto.PatientDTO;
import com.ertriage.dto.PatientEventDTO;
import com.ertriage.model.Patient;
import com.ertriage.model.PatientEvent;
import com.ertriage.model.QrAccessToken;
import com.ertriage.repository.PatientEventRepository;
import com.ertriage.repository.PatientRepository;
import com.ertriage.repository.QrAccessTokenRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QrService {

    private final QrAccessTokenRepository tokenRepository;
    private final PatientRepository patientRepository;
    private final PatientEventRepository eventRepository;

    public QrService(QrAccessTokenRepository tokenRepository,
                     PatientRepository patientRepository,
                     PatientEventRepository eventRepository) {
        this.tokenRepository = tokenRepository;
        this.patientRepository = patientRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Generates a new QR token for the given patient, or refreshes an existing one.
     * Returns the token string.
     */
    public String generateOrRefreshToken(String patientId) {
        // Verify patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with id: " + patientId));

        // Check for existing token
        return tokenRepository.findByPatientId(patientId)
                .map(existing -> {
                    existing.refresh();
                    tokenRepository.save(existing);
                    return existing.getToken();
                })
                .orElseGet(() -> {
                    QrAccessToken newToken = new QrAccessToken(patientId);
                    tokenRepository.save(newToken);
                    return newToken.getToken();
                });
    }

    /**
     * Validates a QR token and returns the full patient history.
     * Throws if token is invalid or expired.
     */
    public PatientDTO getPatientByToken(String token) {
        QrAccessToken accessToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid QR code. Token not found."));

        if (accessToken.isExpired()) {
            throw new IllegalStateException("This QR code has expired. Please request a new one.");
        }

        Patient patient = patientRepository.findById(accessToken.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient record no longer exists."));

        // Build full DTO with timeline
        PatientDTO dto = PatientDTO.fromEntity(patient);
        List<PatientEventDTO> timeline = eventRepository
                .findByPatientIdOrderByTimestampAsc(patient.getId())
                .stream()
                .map(this::toEventDTO)
                .collect(Collectors.toList());
        dto.setTimeline(timeline);

        return dto;
    }

    private PatientEventDTO toEventDTO(PatientEvent event) {
        return new PatientEventDTO(
                event.getId(),
                event.getEventType().name(),
                event.getDescription(),
                event.getOldPriority(),
                event.getNewPriority(),
                event.getPerformedBy(),
                event.getTimestamp());
    }
}
