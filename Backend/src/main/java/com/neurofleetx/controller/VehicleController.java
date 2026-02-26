package com.neurofleetx.controller;

import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {
    
    @Autowired
    private VehicleService vehicleService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", vehicles);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getVehicleById(@PathVariable String id) {
        return vehicleService.getVehicleById(id)
                .map(vehicle -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", vehicle);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createVehicle(@RequestBody Vehicle vehicle) {
        Vehicle savedVehicle = vehicleService.createVehicle(vehicle);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", savedVehicle);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateVehicle(@PathVariable String id, @RequestBody Vehicle vehicle) {
        Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicle);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updatedVehicle);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteVehicle(@PathVariable String id) {
        vehicleService.deleteVehicle(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Vehicle deleted");
        return ResponseEntity.ok(response);
    }
}
