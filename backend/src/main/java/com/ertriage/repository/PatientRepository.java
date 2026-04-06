package com.ertriage.repository;

import com.ertriage.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {
    List<Patient> findAllByOrderByPriorityAscTimestampAsc();
    List<Patient> findByNameContainingIgnoreCaseOrSymptomsContainingIgnoreCase(String name, String symptoms);

    /**
     * Finds patients assigned to a doctor by username OR fullName (backward-compat for
     * records created before assignedDoctorUsername was introduced).
     */
    @Query(value = "{'$or': [{'assignedDoctorUsername': ?0}, {'assignedDoctorName': ?1}]}", sort = "{'priority': 1, 'timestamp': 1}")
    List<Patient> findPatientsForDoctor(String username, String fullName);

    /**
     * Finds patients assigned to a nurse by username OR fullName (backward-compat).
     */
    @Query(value = "{'$or': [{'assignedNurseUsername': ?0}, {'assignedNurseName': ?1}]}", sort = "{'priority': 1, 'timestamp': 1}")
    List<Patient> findPatientsForNurse(String username, String fullName);
}
