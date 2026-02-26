package com.neurofleetx.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "vehicles")
public class Vehicle {
    
    @Id
    private String id;
    
    private String vin;
    private String model;
    private String status;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    
    public Vehicle() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Vehicle(String vin, String model, String status) {
        this.vin = vin;
        this.model = model;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getVin() {
        return vin;
    }
    
    public void setVin(String vin) {
        this.vin = vin;
    }
    
    public String getModel() {
        return model;
    }
    
    public void setModel(String model) {
        this.model = model;
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
}
