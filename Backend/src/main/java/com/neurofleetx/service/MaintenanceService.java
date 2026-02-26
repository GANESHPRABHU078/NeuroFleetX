package com.neurofleetx.service;

import com.neurofleetx.entity.VehicleMaintenance;
import com.neurofleetx.entity.VehicleMaintenance.MaintenanceAlert;
import com.neurofleetx.entity.VehicleMaintenance.ComponentHealth;
import com.neurofleetx.repository.VehicleMaintenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class MaintenanceService {

    @Autowired
    private VehicleMaintenanceRepository maintenanceRepository;

    // Get all vehicle maintenance records
    public List<VehicleMaintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    // Get maintenance by vehicle ID
    public Optional<VehicleMaintenance> getMaintenanceByVehicleId(String vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId);
    }

    // Get maintenance by health status
    public List<VehicleMaintenance> getByHealthStatus(String healthStatus) {
        return maintenanceRepository.findByHealthStatus(healthStatus);
    }

    // Get maintenance by risk level
    public List<VehicleMaintenance> getByRiskLevel(String riskLevel) {
        return maintenanceRepository.findByRiskLevel(riskLevel);
    }

    // Get vehicles requiring urgent maintenance (health score < 50)
    public List<VehicleMaintenance> getUrgentMaintenanceVehicles() {
        return maintenanceRepository.findByHealthScoreLessThan(50);
    }

    // Create or update vehicle maintenance record
    public VehicleMaintenance createOrUpdateMaintenance(VehicleMaintenance maintenance) {
        Optional<VehicleMaintenance> existing = maintenanceRepository.findByVehicleId(maintenance.getVehicleId());
        
        if (existing.isPresent()) {
            VehicleMaintenance existingMaintenance = existing.get();
            updateMaintenanceFields(existingMaintenance, maintenance);
            existingMaintenance.setUpdatedAt(LocalDateTime.now());
            return maintenanceRepository.save(existingMaintenance);
        } else {
            maintenance.setCreatedAt(LocalDateTime.now());
            maintenance.setUpdatedAt(LocalDateTime.now());
            calculateMaintenanceMetrics(maintenance);
            return maintenanceRepository.save(maintenance);
        }
    }

    // Update maintenance record
    public VehicleMaintenance updateMaintenance(String id, VehicleMaintenance maintenance) {
        Optional<VehicleMaintenance> existing = maintenanceRepository.findById(id);
        if (existing.isPresent()) {
            VehicleMaintenance updated = existing.get();
            updateMaintenanceFields(updated, maintenance);
            updated.setUpdatedAt(LocalDateTime.now());
            calculateMaintenanceMetrics(updated);
            return maintenanceRepository.save(updated);
        }
        return null;
    }

    // Delete maintenance record
    public void deleteMaintenance(String id) {
        maintenanceRepository.deleteById(id);
    }

    // Get maintenance statistics
    public Map<String, Object> getMaintenanceStatistics() {
        List<VehicleMaintenance> allMaintenance = maintenanceRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVehicles", allMaintenance.size());
        
        // Count by health status
        long excellent = allMaintenance.stream().filter(m -> "Excellent".equals(m.getHealthStatus())).count();
        long good = allMaintenance.stream().filter(m -> "Good".equals(m.getHealthStatus())).count();
        long fair = allMaintenance.stream().filter(m -> "Fair".equals(m.getHealthStatus())).count();
        long poor = allMaintenance.stream().filter(m -> "Poor".equals(m.getHealthStatus())).count();
        long critical = allMaintenance.stream().filter(m -> "Critical".equals(m.getHealthStatus())).count();
        
        stats.put("excellentHealth", excellent);
        stats.put("goodHealth", good);
        stats.put("fairHealth", fair);
        stats.put("poorHealth", poor);
        stats.put("criticalHealth", critical);
        
        // Count by risk level
        long lowRisk = allMaintenance.stream().filter(m -> "Low".equals(m.getRiskLevel())).count();
        long mediumRisk = allMaintenance.stream().filter(m -> "Medium".equals(m.getRiskLevel())).count();
        long highRisk = allMaintenance.stream().filter(m -> "High".equals(m.getRiskLevel())).count();
        long criticalRisk = allMaintenance.stream().filter(m -> "Critical".equals(m.getRiskLevel())).count();
        
        stats.put("lowRisk", lowRisk);
        stats.put("mediumRisk", mediumRisk);
        stats.put("highRisk", highRisk);
        stats.put("criticalRisk", criticalRisk);
        
        // Average health score
        double avgHealthScore = allMaintenance.stream()
            .mapToInt(VehicleMaintenance::getHealthScore)
            .average()
            .orElse(0.0);
        stats.put("averageHealthScore", Math.round(avgHealthScore));
        
        // Total estimated maintenance cost
        double totalCost = allMaintenance.stream()
            .mapToDouble(VehicleMaintenance::getEstimatedMaintenanceCost)
            .sum();
        stats.put("totalEstimatedCost", Math.round(totalCost * 100.0) / 100.0);
        
        // Count of vehicles needing urgent maintenance
        stats.put("urgentMaintenanceCount", maintenanceRepository.findByHealthScoreLessThan(50).size());
        
        return stats;
    }

    // Generate mock maintenance data for testing
    public List<VehicleMaintenance> generateMockMaintenanceData(int count) {
        List<VehicleMaintenance> mockData = new ArrayList<>();
        Random random = new Random();
        
        String[] healthStatuses = {"Excellent", "Good", "Fair", "Poor", "Critical"};
        String[] riskLevels = {"Low", "Medium", "High", "Critical"};
        String[] components = {"Engine", "Transmission", "Brakes", "Tires", "Battery", "Suspension"};
        
        for (int i = 0; i < count; i++) {
            VehicleMaintenance maintenance = new VehicleMaintenance();
            maintenance.setVehicleId("VEH-" + (100 + i));
            maintenance.setVehicleNumber("KA-01-AB-" + (1000 + i));
            
            int healthScore = 30 + random.nextInt(70);
            maintenance.setHealthScore(healthScore);
            
            String healthStatus = healthScore >= 80 ? "Excellent" :
                                 healthScore >= 60 ? "Good" :
                                 healthScore >= 40 ? "Fair" :
                                 healthScore >= 20 ? "Poor" : "Critical";
            maintenance.setHealthStatus(healthStatus);
            
            LocalDateTime lastMaintenance = LocalDateTime.now().minusDays(random.nextInt(90));
            maintenance.setLastMaintenanceDate(lastMaintenance);
            maintenance.setNextScheduledMaintenance(lastMaintenance.plusDays(90));
            
            long daysSince = ChronoUnit.DAYS.between(lastMaintenance, LocalDateTime.now());
            maintenance.setDaysSinceLastMaintenance((int) daysSince);
            
            long daysUntil = ChronoUnit.DAYS.between(LocalDateTime.now(), lastMaintenance.plusDays(90));
            maintenance.setDaysUntilNextMaintenance((int) daysUntil);
            
            maintenance.setTotalMileage(50000 + random.nextInt(150000));
            maintenance.setMileageSinceLastService(5000 + random.nextInt(15000));
            
            // Generate alerts
            List<MaintenanceAlert> alerts = new ArrayList<>();
            int alertCount = random.nextInt(4);
            for (int j = 0; j < alertCount; j++) {
                String component = components[random.nextInt(components.length)];
                String alertType = healthScore < 40 ? "critical" : "warning";
                String severity = healthScore < 40 ? "high" : random.nextBoolean() ? "medium" : "low";
                String message = component + " requires attention";
                alerts.add(new MaintenanceAlert(alertType, component, message, severity));
            }
            maintenance.setAlerts(alerts);
            
            // Generate component health
            List<ComponentHealth> componentHealthList = new ArrayList<>();
            for (String component : components) {
                int componentHealth = 40 + random.nextInt(60);
                String componentStatus = componentHealth >= 80 ? "Good" :
                                        componentHealth >= 60 ? "Fair" :
                                        componentHealth >= 40 ? "Poor" : "Critical";
                int lifespan = (int) (componentHealth * 3.65); // days
                String recommendation = componentHealth < 60 ? "Schedule maintenance soon" : "Normal operation";
                componentHealthList.add(new ComponentHealth(component, componentHealth, componentStatus, lifespan, recommendation));
            }
            maintenance.setComponentHealth(componentHealthList);
            
            String riskLevel = healthScore >= 70 ? "Low" :
                              healthScore >= 50 ? "Medium" :
                              healthScore >= 30 ? "High" : "Critical";
            maintenance.setRiskLevel(riskLevel);
            
            maintenance.setEstimatedMaintenanceCost(5000 + random.nextDouble() * 20000);
            maintenance.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(180)));
            maintenance.setUpdatedAt(LocalDateTime.now());
            
            mockData.add(maintenanceRepository.save(maintenance));
        }
        
        return mockData;
    }

    // Helper method to update maintenance fields
    private void updateMaintenanceFields(VehicleMaintenance target, VehicleMaintenance source) {
        if (source.getVehicleNumber() != null) target.setVehicleNumber(source.getVehicleNumber());
        if (source.getHealthScore() > 0) target.setHealthScore(source.getHealthScore());
        if (source.getHealthStatus() != null) target.setHealthStatus(source.getHealthStatus());
        if (source.getLastMaintenanceDate() != null) target.setLastMaintenanceDate(source.getLastMaintenanceDate());
        if (source.getNextScheduledMaintenance() != null) target.setNextScheduledMaintenance(source.getNextScheduledMaintenance());
        if (source.getTotalMileage() > 0) target.setTotalMileage(source.getTotalMileage());
        if (source.getMileageSinceLastService() > 0) target.setMileageSinceLastService(source.getMileageSinceLastService());
        if (source.getAlerts() != null) target.setAlerts(source.getAlerts());
        if (source.getComponentHealth() != null) target.setComponentHealth(source.getComponentHealth());
        if (source.getRiskLevel() != null) target.setRiskLevel(source.getRiskLevel());
        if (source.getEstimatedMaintenanceCost() > 0) target.setEstimatedMaintenanceCost(source.getEstimatedMaintenanceCost());
    }

    // Helper method to calculate maintenance metrics
    private void calculateMaintenanceMetrics(VehicleMaintenance maintenance) {
        if (maintenance.getLastMaintenanceDate() != null) {
            long daysSince = ChronoUnit.DAYS.between(maintenance.getLastMaintenanceDate(), LocalDateTime.now());
            maintenance.setDaysSinceLastMaintenance((int) daysSince);
        }
        
        if (maintenance.getNextScheduledMaintenance() != null) {
            long daysUntil = ChronoUnit.DAYS.between(LocalDateTime.now(), maintenance.getNextScheduledMaintenance());
            maintenance.setDaysUntilNextMaintenance((int) daysUntil);
        }
    }
}
