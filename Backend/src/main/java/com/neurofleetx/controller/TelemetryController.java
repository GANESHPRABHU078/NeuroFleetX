package com.neurofleetx.controller;

import com.neurofleetx.entity.Telemetry;
import com.neurofleetx.service.TelemetryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin(origins = "*")
public class TelemetryController {
    
    @Autowired
    private TelemetryService telemetryService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTelemetry() {
        List<Telemetry> telemetry = telemetryService.getAllTelemetry();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", telemetry);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getTelemetryByVehicleId(@PathVariable String vehicleId) {
        List<Telemetry> telemetry = telemetryService.getTelemetryByVehicleId(vehicleId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", telemetry);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTelemetry(@RequestBody Telemetry telemetry) {
        Telemetry savedTelemetry = telemetryService.createTelemetry(telemetry);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", savedTelemetry);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/update-location")
    public ResponseEntity<Map<String, Object>> updateLocation(@RequestBody Map<String, Object> locationData) {
        try {
            Telemetry telemetry = new Telemetry();
            
            // Extract data from request
            if (locationData.containsKey("vehicleId")) {
                telemetry.setVehicleId(locationData.get("vehicleId").toString());
            }
            if (locationData.containsKey("driverId")) {
                telemetry.setDriverId(locationData.get("driverId").toString());
            }
            if (locationData.containsKey("latitude")) {
                telemetry.setLatitude(new java.math.BigDecimal(locationData.get("latitude").toString()));
            }
            if (locationData.containsKey("longitude")) {
                telemetry.setLongitude(new java.math.BigDecimal(locationData.get("longitude").toString()));
            }
            if (locationData.containsKey("speed")) {
                telemetry.setSpeed(new java.math.BigDecimal(locationData.get("speed").toString()));
            }
            
            Telemetry savedTelemetry = telemetryService.createTelemetry(telemetry);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Location updated successfully");
            response.put("data", savedTelemetry);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update location: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTelemetry(@PathVariable String id) {
        telemetryService.deleteTelemetry(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Telemetry deleted");
        return ResponseEntity.ok(response);
    }
}
