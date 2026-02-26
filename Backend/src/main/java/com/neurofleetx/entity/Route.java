package com.neurofleetx.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "routes")
public class Route {

    @Id
    private String id;

    private String driverId;
    private String driverName;
    private String driverUsername; // Username of the assigned driver
    private String createdByUsername; // Username of the fleet manager who created the route
    private String assignedByUsername; // Username of the fleet manager who assigned the route

    // Start location
    private String startLocationName;
    private Double startLatitude;
    private Double startLongitude;

    // End location
    private String endLocationName;
    private Double endLatitude;
    private Double endLongitude;

    // Route details
    private Double distance; // in kilometers
    private Integer estimatedDuration; // in minutes
    private Integer actualDuration; // in minutes

    // Status and timestamps
    private String status; // "assigned", "in_progress", "completed", "cancelled"
    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;

    private String notes;

    public Route() {
        this.createdAt = LocalDateTime.now();
        this.status = "assigned";
    }

    public Route(String driverId, String driverName, String startLocationName,
                 Double startLatitude, Double startLongitude, String endLocationName,
                 Double endLatitude, Double endLongitude, Double distance,
                 Integer estimatedDuration) {
        this.driverId = driverId;
        this.driverName = driverName;
        this.startLocationName = startLocationName;
        this.startLatitude = startLatitude;
        this.startLongitude = startLongitude;
        this.endLocationName = endLocationName;
        this.endLatitude = endLatitude;
        this.endLongitude = endLongitude;
        this.distance = distance;
        this.estimatedDuration = estimatedDuration;
        this.status = "assigned";
        this.assignedAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getDriverUsername() {
        return driverUsername;
    }

    public void setDriverUsername(String driverUsername) {
        this.driverUsername = driverUsername;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public String getAssignedByUsername() {
        return assignedByUsername;
    }

    public void setAssignedByUsername(String assignedByUsername) {
        this.assignedByUsername = assignedByUsername;
    }

    public String getStartLocationName() {
        return startLocationName;
    }

    public void setStartLocationName(String startLocationName) {
        this.startLocationName = startLocationName;
    }

    public Double getStartLatitude() {
        return startLatitude;
    }

    public void setStartLatitude(Double startLatitude) {
        this.startLatitude = startLatitude;
    }

    public Double getStartLongitude() {
        return startLongitude;
    }

    public void setStartLongitude(Double startLongitude) {
        this.startLongitude = startLongitude;
    }

    public String getEndLocationName() {
        return endLocationName;
    }

    public void setEndLocationName(String endLocationName) {
        this.endLocationName = endLocationName;
    }

    public Double getEndLatitude() {
        return endLatitude;
    }

    public void setEndLatitude(Double endLatitude) {
        this.endLatitude = endLatitude;
    }

    public Double getEndLongitude() {
        return endLongitude;
    }

    public void setEndLongitude(Double endLongitude) {
        this.endLongitude = endLongitude;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Integer getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(Integer estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public Integer getActualDuration() {
        return actualDuration;
    }

    public void setActualDuration(Integer actualDuration) {
        this.actualDuration = actualDuration;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}