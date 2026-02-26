package com.neurofleetx.controller;

import com.neurofleetx.entity.FleetManager;
import com.neurofleetx.service.FleetManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fleet-managers")
@CrossOrigin(origins = "*")
public class FleetManagerController {

    @Autowired
    private FleetManagerService fleetManagerService;

    // Get all fleet managers
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllFleetManagers() {
        List<FleetManager> fleetManagers = fleetManagerService.getAllFleetManagers();
        // Remove passwords from response
        fleetManagers.forEach(fm -> fm.setPassword(null));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", fleetManagers);
        return ResponseEntity.ok(response);
    }

    // Get fleet manager by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFleetManagerById(@PathVariable String id) {
        return fleetManagerService.getFleetManagerById(id)
                .map(fleetManager -> {
                    // Remove password from response
                    fleetManager.setPassword(null);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", fleetManager);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update fleet manager
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFleetManager(@PathVariable String id, @RequestBody FleetManager fleetManager) {
        FleetManager updatedFleetManager = fleetManagerService.updateFleetManager(id, fleetManager);
        // Remove password from response
        updatedFleetManager.setPassword(null);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updatedFleetManager);
        return ResponseEntity.ok(response);
    }

    // Delete fleet manager
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFleetManager(@PathVariable String id) {
        fleetManagerService.deleteFleetManager(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Fleet manager deleted");
        return ResponseEntity.ok(response);
    }
}