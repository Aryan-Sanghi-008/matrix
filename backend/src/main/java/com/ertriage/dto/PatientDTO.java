package com.ertriage.dto;

import com.ertriage.model.Patient;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PatientDTO {
    private String id;
    private String name;
    private Integer age;
    private String symptoms;
    private String vitals;
    private String priority;
    private String rawInput;
    private String assignedCareZone;
    private String assignedRoom;
    private String assignedDoctorName;
    private String assignedDoctorUsername;
    private String assignedDoctorSpecialization;
    private String assignedNurseName;
    private String assignedNurseUsername;
    private String assignedSupportStaff;
    private List<String> assignedEquipment;
    private LocalDateTime timestamp;
    private List<PatientEventDTO> timeline;

    public PatientDTO() {
        this.assignedEquipment = new ArrayList<>();
        this.timeline = new ArrayList<>();
    }

    public PatientDTO(String id, String name, Integer age, String symptoms, String vitals,
        String priority, String rawInput, String assignedCareZone, String assignedRoom,
        String assignedDoctorName, String assignedDoctorUsername, String assignedDoctorSpecialization,
        String assignedNurseName, String assignedNurseUsername,
        String assignedSupportStaff, List<String> assignedEquipment, LocalDateTime timestamp,
        List<PatientEventDTO> timeline) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.symptoms = symptoms;
        this.vitals = vitals;
        this.priority = priority;
        this.rawInput = rawInput;
        this.assignedCareZone = assignedCareZone;
        this.assignedRoom = assignedRoom;
        this.assignedDoctorName = assignedDoctorName;
        this.assignedDoctorUsername = assignedDoctorUsername;
        this.assignedDoctorSpecialization = assignedDoctorSpecialization;
        this.assignedNurseName = assignedNurseName;
        this.assignedNurseUsername = assignedNurseUsername;
        this.assignedSupportStaff = assignedSupportStaff;
        this.assignedEquipment = assignedEquipment != null ? assignedEquipment : new ArrayList<>();
        this.timestamp = timestamp;
        this.timeline = timeline != null ? timeline : new ArrayList<>();
    }

    public static PatientDTO fromEntity(Patient patient) {
        return new PatientDTO(
                patient.getId(), patient.getName(), patient.getAge(),
                patient.getSymptoms(), patient.getVitals(),
                patient.getPriority() != null ? patient.getPriority().name() : "GREEN",
                patient.getRawInput(), patient.getAssignedCareZone(), patient.getAssignedRoom(),
                patient.getAssignedDoctorName(), patient.getAssignedDoctorUsername(),
                patient.getAssignedDoctorSpecialization(),
                patient.getAssignedNurseName(), patient.getAssignedNurseUsername(),
                patient.getAssignedSupportStaff(), patient.getAssignedEquipment(),
                patient.getTimestamp(), new ArrayList<>());
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Integer getAge() {
        return age;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public String getVitals() {
        return vitals;
    }

    public String getPriority() {
        return priority;
    }

    public String getRawInput() {
        return rawInput;
    }

    public String getAssignedCareZone() {
        return assignedCareZone;
    }

    public String getAssignedRoom() {
        return assignedRoom;
    }

    public String getAssignedDoctorName() {
        return assignedDoctorName;
    }

    public String getAssignedDoctorUsername() {
        return assignedDoctorUsername;
    }

    public String getAssignedDoctorSpecialization() {
        return assignedDoctorSpecialization;
    }

    public String getAssignedNurseName() {
        return assignedNurseName;
    }

    public String getAssignedNurseUsername() {
        return assignedNurseUsername;
    }

    public String getAssignedSupportStaff() {
        return assignedSupportStaff;
    }

    public List<String> getAssignedEquipment() {
        return assignedEquipment;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public List<PatientEventDTO> getTimeline() {
        return timeline;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public void setVitals(String vitals) {
        this.vitals = vitals;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setRawInput(String rawInput) {
        this.rawInput = rawInput;
    }

    public void setAssignedCareZone(String assignedCareZone) {
        this.assignedCareZone = assignedCareZone;
    }

    public void setAssignedRoom(String assignedRoom) {
        this.assignedRoom = assignedRoom;
    }

    public void setAssignedDoctorName(String assignedDoctorName) {
        this.assignedDoctorName = assignedDoctorName;
    }

    public void setAssignedDoctorUsername(String assignedDoctorUsername) {
        this.assignedDoctorUsername = assignedDoctorUsername;
    }

    public void setAssignedDoctorSpecialization(String assignedDoctorSpecialization) {
        this.assignedDoctorSpecialization = assignedDoctorSpecialization;
    }

    public void setAssignedNurseName(String assignedNurseName) {
        this.assignedNurseName = assignedNurseName;
    }

    public void setAssignedNurseUsername(String assignedNurseUsername) {
        this.assignedNurseUsername = assignedNurseUsername;
    }

    public void setAssignedSupportStaff(String assignedSupportStaff) {
        this.assignedSupportStaff = assignedSupportStaff;
    }

    public void setAssignedEquipment(List<String> assignedEquipment) {
        this.assignedEquipment = assignedEquipment;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setTimeline(List<PatientEventDTO> timeline) {
        this.timeline = timeline;
    }
}
