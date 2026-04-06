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

    // Removed generateQrToken — moved to PatientController for path consistency and security logic.

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
