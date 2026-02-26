package com.neurofleetx.controller;

import com.neurofleetx.entity.VehicleMaintenance;
import com.neurofleetx.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    // Get all maintenance records
    @GetMapping
    public ResponseEntity<List<VehicleMaintenance>> getAllMaintenance() {
        List<VehicleMaintenance> maintenance = maintenanceService.getAllMaintenance();
        return ResponseEntity.ok(maintenance);
    }

    // Get maintenance by vehicle ID
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<VehicleMaintenance> getMaintenanceByVehicleId(@PathVariable String vehicleId) {
        Optional<VehicleMaintenance> maintenance = maintenanceService.getMaintenanceByVehicleId(vehicleId);
        return maintenance.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    // Get maintenance by health status
    @GetMapping("/health-status/{healthStatus}")
    public ResponseEntity<List<VehicleMaintenance>> getByHealthStatus(@PathVariable String healthStatus) {
        List<VehicleMaintenance> maintenance = maintenanceService.getByHealthStatus(healthStatus);
        return ResponseEntity.ok(maintenance);
    }

    // Get maintenance by risk level
    @GetMapping("/risk-level/{riskLevel}")
    public ResponseEntity<List<VehicleMaintenance>> getByRiskLevel(@PathVariable String riskLevel) {
        List<VehicleMaintenance> maintenance = maintenanceService.getByRiskLevel(riskLevel);
        return ResponseEntity.ok(maintenance);
    }

    // Get vehicles requiring urgent maintenance
    @GetMapping("/urgent")
    public ResponseEntity<List<VehicleMaintenance>> getUrgentMaintenanceVehicles() {
        List<VehicleMaintenance> maintenance = maintenanceService.getUrgentMaintenanceVehicles();
        return ResponseEntity.ok(maintenance);
    }

    // Create or update maintenance record
    @PostMapping
    public ResponseEntity<VehicleMaintenance> createOrUpdateMaintenance(@RequestBody VehicleMaintenance maintenance) {
        VehicleMaintenance saved = maintenanceService.createOrUpdateMaintenance(maintenance);
        return ResponseEntity.ok(saved);
    }

    // Update maintenance record
    @PutMapping("/{id}")
    public ResponseEntity<VehicleMaintenance> updateMaintenance(
            @PathVariable String id,
            @RequestBody VehicleMaintenance maintenance) {
        VehicleMaintenance updated = maintenanceService.updateMaintenance(id, maintenance);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete maintenance record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable String id) {
        maintenanceService.deleteMaintenance(id);
        return ResponseEntity.ok().build();
    }

    // Get maintenance statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getMaintenanceStatistics() {
        Map<String, Object> stats = maintenanceService.getMaintenanceStatistics();
        return ResponseEntity.ok(stats);
    }

    // Generate mock data (for testing)
    @PostMapping("/generate-mock/{count}")
    public ResponseEntity<List<VehicleMaintenance>> generateMockData(@PathVariable int count) {
        List<VehicleMaintenance> mockData = maintenanceService.generateMockMaintenanceData(count);
        return ResponseEntity.ok(mockData);
    }
}
