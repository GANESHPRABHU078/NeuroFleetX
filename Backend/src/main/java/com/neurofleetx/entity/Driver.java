package com.neurofleetx.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "drivers")
public class Driver {
    
    @Id
    private String id;
    
    private String name;
    private String username;
    private String password;
    private String licenseNumber;
    private String phone;
    private String email;
    private String status = "active";
    private Double rating = 5.0;
    private Double latitude;
    private Double longitude;
    private Boolean gpsEnabled = false;
    private LocalDateTime lastLocationUpdate;
    private Double currentSpeed = 0.0;
    private LocalDateTime createdAt;
    
    // Constructors
    public Driver() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Driver(String name, String licenseNumber, String phone) {
        this.name = name;
        this.licenseNumber = licenseNumber;
        this.phone = phone;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getLicenseNumber() {
        return licenseNumber;
    }
    
    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Boolean getGpsEnabled() {
        return gpsEnabled;
    }

    public void setGpsEnabled(Boolean gpsEnabled) {
        this.gpsEnabled = gpsEnabled;
    }

    public LocalDateTime getLastLocationUpdate() {
        return lastLocationUpdate;
    }

    public void setLastLocationUpdate(LocalDateTime lastLocationUpdate) {
        this.lastLocationUpdate = lastLocationUpdate;
    }

    public Double getCurrentSpeed() {
        return currentSpeed;
    }

    public void setCurrentSpeed(Double currentSpeed) {
        this.currentSpeed = currentSpeed;
    }
}
