package com.ertriage.controller;

import com.ertriage.dto.PatientDTO;
import com.ertriage.service.QrService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class QrController {

    private final QrService qrService;

    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    /**
     * Generate/refresh a QR access token for a patient.
     * Requires authentication (any staff member).
     */
    @PostMapping("/api/patients/{id}/qr-token")
    public ResponseEntity<Map<String, String>> generateQrToken(@PathVariable String id) {
        try {
            String token = qrService.generateOrRefreshToken(id);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Public endpoint — retrieve patient history by QR token.
     * No authentication required. Anyone with the QR code can access this.
     */
    @GetMapping("/api/qr/{token}")
    public ResponseEntity<?> getPatientByQrToken(@PathVariable String token) {
        try {
            PatientDTO patient = qrService.getPatientByToken(token);
            return ResponseEntity.ok(patient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(410)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
