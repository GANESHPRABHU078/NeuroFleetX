package com.neurofleetx.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "vehicle_maintenance")
public class VehicleMaintenance {
    @Id
    private String id;
    private String vehicleId;
    private String vehicleNumber;
    private int healthScore; // 0-100
    private String healthStatus; // "Excellent", "Good", "Fair", "Poor", "Critical"
    private LocalDateTime lastMaintenanceDate;
    private LocalDateTime nextScheduledMaintenance;
    private int daysSinceLastMaintenance;
    private int daysUntilNextMaintenance;
    private double totalMileage;
    private double mileageSinceLastService;
    private List<MaintenanceAlert> alerts;
    private List<ComponentHealth> componentHealth;
    private String riskLevel; // "Low", "Medium", "High", "Critical"
    private double estimatedMaintenanceCost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class MaintenanceAlert {
        private String alertType; // "warning", "critical", "info"
        private String component;
        private String message;
        private String severity; // "low", "medium", "high", "critical"
        private LocalDateTime detectedAt;
        private boolean acknowledged;

        // Constructors
        public MaintenanceAlert() {}

        public MaintenanceAlert(String alertType, String component, String message, String severity) {
            this.alertType = alertType;
            this.component = component;
            this.message = message;
            this.severity = severity;
            this.detectedAt = LocalDateTime.now();
            this.acknowledged = false;
        }

        // Getters and Setters
        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }

        public String getComponent() { return component; }
        public void setComponent(String component) { this.component = component; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }

        public LocalDateTime getDetectedAt() { return detectedAt; }
        public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }

        public boolean isAcknowledged() { return acknowledged; }
        public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }
    }

    public static class ComponentHealth {
        private String componentName;
        private int healthPercentage; // 0-100
        private String status; // "Good", "Fair", "Poor", "Critical"
        private int remainingLifespan; // in days
        private String recommendation;

        // Constructors
        public ComponentHealth() {}

        public ComponentHealth(String componentName, int healthPercentage, String status, 
                              int remainingLifespan, String recommendation) {
            this.componentName = componentName;
            this.healthPercentage = healthPercentage;
            this.status = status;
            this.remainingLifespan = remainingLifespan;
            this.recommendation = recommendation;
        }

        // Getters and Setters
        public String getComponentName() { return componentName; }
        public void setComponentName(String componentName) { this.componentName = componentName; }

        public int getHealthPercentage() { return healthPercentage; }
        public void setHealthPercentage(int healthPercentage) { this.healthPercentage = healthPercentage; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getRemainingLifespan() { return remainingLifespan; }
        public void setRemainingLifespan(int remainingLifespan) { this.remainingLifespan = remainingLifespan; }

        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }

    // Constructors
    public VehicleMaintenance() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public int getHealthScore() { return healthScore; }
    public void setHealthScore(int healthScore) { this.healthScore = healthScore; }

    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }

    public LocalDateTime getLastMaintenanceDate() { return lastMaintenanceDate; }
    public void setLastMaintenanceDate(LocalDateTime lastMaintenanceDate) { 
        this.lastMaintenanceDate = lastMaintenanceDate; 
    }

    public LocalDateTime getNextScheduledMaintenance() { return nextScheduledMaintenance; }
    public void setNextScheduledMaintenance(LocalDateTime nextScheduledMaintenance) { 
        this.nextScheduledMaintenance = nextScheduledMaintenance; 
    }

    public int getDaysSinceLastMaintenance() { return daysSinceLastMaintenance; }
    public void setDaysSinceLastMaintenance(int daysSinceLastMaintenance) { 
        this.daysSinceLastMaintenance = daysSinceLastMaintenance; 
    }

    public int getDaysUntilNextMaintenance() { return daysUntilNextMaintenance; }
    public void setDaysUntilNextMaintenance(int daysUntilNextMaintenance) { 
        this.daysUntilNextMaintenance = daysUntilNextMaintenance; 
    }

    public double getTotalMileage() { return totalMileage; }
    public void setTotalMileage(double totalMileage) { this.totalMileage = totalMileage; }

    public double getMileageSinceLastService() { return mileageSinceLastService; }
    public void setMileageSinceLastService(double mileageSinceLastService) { 
        this.mileageSinceLastService = mileageSinceLastService; 
    }

    public List<MaintenanceAlert> getAlerts() { return alerts; }
    public void setAlerts(List<MaintenanceAlert> alerts) { this.alerts = alerts; }

    public List<ComponentHealth> getComponentHealth() { return componentHealth; }
    public void setComponentHealth(List<ComponentHealth> componentHealth) { 
        this.componentHealth = componentHealth; 
    }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public double getEstimatedMaintenanceCost() { return estimatedMaintenanceCost; }
    public void setEstimatedMaintenanceCost(double estimatedMaintenanceCost) { 
        this.estimatedMaintenanceCost = estimatedMaintenanceCost; 
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
