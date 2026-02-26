package com.neurofleetx.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String vehicleId;
    private String vehicleName;
    private String vehicleRegistration;

    // Booking dates
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Booking details
    private String purpose;
    private String pickupLocation;
    private String dropoffLocation;
    private String contactNumber;

    // Driver and Route Assignment
    private String assignedDriverId;
    private String assignedDriverName;
    private String assignedRouteId;
    private LocalDateTime assignedAt;

    // Status and timestamps
    private String status; // "pending", "confirmed", "active", "completed", "cancelled"
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;

    // Additional info
    private String notes;
    private Double estimatedCost;
    private String createdByUsername;

    public Booking() {
        this.createdAt = LocalDateTime.now();
        this.status = "pending";
    }

    public Booking(String userId, String userName, String vehicleId, String vehicleName,
                   LocalDateTime startDate, LocalDateTime endDate, String purpose) {
        this.userId = userId;
        this.userName = userName;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.purpose = purpose;
        this.createdAt = LocalDateTime.now();
        this.status = "pending";
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public String getVehicleRegistration() {
        return vehicleRegistration;
    }

    public void setVehicleRegistration(String vehicleRegistration) {
        this.vehicleRegistration = vehicleRegistration;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public String getDropoffLocation() {
        return dropoffLocation;
    }

    public void setDropoffLocation(String dropoffLocation) {
        this.dropoffLocation = dropoffLocation;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public String getAssignedDriverId() {
        return assignedDriverId;
    }

    public void setAssignedDriverId(String assignedDriverId) {
        this.assignedDriverId = assignedDriverId;
    }

    public String getAssignedDriverName() {
        return assignedDriverName;
    }

    public void setAssignedDriverName(String assignedDriverName) {
        this.assignedDriverName = assignedDriverName;
    }

    public String getAssignedRouteId() {
        return assignedRouteId;
    }

    public void setAssignedRouteId(String assignedRouteId) {
        this.assignedRouteId = assignedRouteId;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
