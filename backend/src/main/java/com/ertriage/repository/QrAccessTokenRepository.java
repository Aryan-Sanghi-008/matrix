package com.ertriage.repository;

import com.ertriage.model.QrAccessToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface QrAccessTokenRepository extends MongoRepository<QrAccessToken, String> {

    Optional<QrAccessToken> findByToken(String token);

    Optional<QrAccessToken> findByPatientId(String patientId);
}
