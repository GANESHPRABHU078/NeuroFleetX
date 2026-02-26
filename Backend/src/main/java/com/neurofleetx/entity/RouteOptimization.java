package com.neurofleetx.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "route_optimizations")
public class RouteOptimization {
    @Id
    private String id;
    private String routeId;
    private String vehicleId;
    private String driverId;
    private List<Location> optimizedPath;
    private double estimatedDistance;
    private double estimatedDuration;
    private double fuelEfficiency;
    private int loadCapacity;
    private int currentLoad;
    private double costSavings;
    private String optimizationAlgorithm;
    private LocalDateTime calculatedAt;
    private String status; // "pending", "active", "completed"

    public static class Location {
        private double latitude;
        private double longitude;
        private String address;
        private int sequenceNumber;

        // Constructors
        public Location() {}

        public Location(double latitude, double longitude, String address, int sequenceNumber) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.address = address;
            this.sequenceNumber = sequenceNumber;
        }

        // Getters and Setters
        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }

        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public int getSequenceNumber() { return sequenceNumber; }
        public void setSequenceNumber(int sequenceNumber) { this.sequenceNumber = sequenceNumber; }
    }

    // Constructors
    public RouteOptimization() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRouteId() { return routeId; }
    public void setRouteId(String routeId) { this.routeId = routeId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public List<Location> getOptimizedPath() { return optimizedPath; }
    public void setOptimizedPath(List<Location> optimizedPath) { this.optimizedPath = optimizedPath; }

    public double getEstimatedDistance() { return estimatedDistance; }
    public void setEstimatedDistance(double estimatedDistance) { this.estimatedDistance = estimatedDistance; }

    public double getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(double estimatedDuration) { this.estimatedDuration = estimatedDuration; }

    public double getFuelEfficiency() { return fuelEfficiency; }
    public void setFuelEfficiency(double fuelEfficiency) { this.fuelEfficiency = fuelEfficiency; }

    public int getLoadCapacity() { return loadCapacity; }
    public void setLoadCapacity(int loadCapacity) { this.loadCapacity = loadCapacity; }

    public int getCurrentLoad() { return currentLoad; }
    public void setCurrentLoad(int currentLoad) { this.currentLoad = currentLoad; }

    public double getCostSavings() { return costSavings; }
    public void setCostSavings(double costSavings) { this.costSavings = costSavings; }

    public String getOptimizationAlgorithm() { return optimizationAlgorithm; }
    public void setOptimizationAlgorithm(String optimizationAlgorithm) { 
        this.optimizationAlgorithm = optimizationAlgorithm; 
    }

    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
