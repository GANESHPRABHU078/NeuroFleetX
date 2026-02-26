package com.neurofleetx.controller;

import com.neurofleetx.entity.Driver;
import com.neurofleetx.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriverController {
    
    @Autowired
    private DriverService driverService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        // Remove passwords from response
        drivers.forEach(driver -> driver.setPassword(null));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", drivers);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDriverById(@PathVariable String id) {
        return driverService.getDriverById(id)
                .map(driver -> {
                    // Remove password from response
                    driver.setPassword(null);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", driver);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createDriver(@RequestBody Driver driver) {
        Driver savedDriver = driverService.createDriver(driver);
        // Remove password from response
        savedDriver.setPassword(null);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", savedDriver);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDriver(@PathVariable String id, @RequestBody Driver driver) {
        Driver updatedDriver = driverService.updateDriver(id, driver);
        // Remove password from response
        updatedDriver.setPassword(null);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updatedDriver);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDriver(@PathVariable("id") String id) {
        driverService.deleteDriver(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Driver deleted");
        return ResponseEntity.ok(response);
    }

    // Update driver GPS location
    @PostMapping("/{id}/update-location")
    public ResponseEntity<Map<String, Object>> updateDriverLocation(
            @PathVariable("id") String id, 
            @RequestBody Map<String, Object> locationData) {
        try {
            return driverService.getDriverById(id)
                .map(driver -> {
                    if (locationData.containsKey("latitude")) {
                        driver.setLatitude(Double.parseDouble(locationData.get("latitude").toString()));
                    }
                    if (locationData.containsKey("longitude")) {
                        driver.setLongitude(Double.parseDouble(locationData.get("longitude").toString()));
                    }
                    if (locationData.containsKey("gpsEnabled")) {
                        driver.setGpsEnabled(Boolean.parseBoolean(locationData.get("gpsEnabled").toString()));
                    }
                    if (locationData.containsKey("speed")) {
                        driver.setCurrentSpeed(Double.parseDouble(locationData.get("speed").toString()));
                    }
                    driver.setLastLocationUpdate(LocalDateTime.now());
                    
                    Driver updatedDriver = driverService.updateDriver(id, driver);
                    updatedDriver.setPassword(null);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Location updated successfully");
                    response.put("data", updatedDriver);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Driver not found");
                    return ResponseEntity.badRequest().body(response);
                });
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update location: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get drivers with GPS enabled (live tracking)
    @GetMapping("/live-tracking")
    public ResponseEntity<Map<String, Object>> getDriversWithGpsEnabled() {
        List<Driver> allDrivers = driverService.getAllDrivers();
        List<Driver> gpsEnabledDrivers = allDrivers.stream()
            .filter(driver -> driver.getGpsEnabled() != null && driver.getGpsEnabled())
            .filter(driver -> driver.getLatitude() != null && driver.getLongitude() != null)
            .collect(Collectors.toList());
        
        // Remove passwords from response
        gpsEnabledDrivers.forEach(driver -> driver.setPassword(null));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", gpsEnabledDrivers);
        response.put("count", gpsEnabledDrivers.size());
        return ResponseEntity.ok(response);
    }

    // Toggle GPS enabled status
    @PostMapping("/{id}/toggle-gps")
    public ResponseEntity<Map<String, Object>> toggleGpsStatus(
            @PathVariable("id") String id, 
            @RequestBody Map<String, Object> data) {
        try {
            return driverService.getDriverById(id)
                .map(driver -> {
                    boolean gpsEnabled = data.containsKey("gpsEnabled") 
                        ? Boolean.parseBoolean(data.get("gpsEnabled").toString())
                        : !Boolean.TRUE.equals(driver.getGpsEnabled());
                    
                    driver.setGpsEnabled(gpsEnabled);
                    if (!gpsEnabled) {
                        // Clear location when GPS is disabled
                        driver.setLatitude(null);
                        driver.setLongitude(null);
                        driver.setCurrentSpeed(0.0);
                    }
                    driver.setLastLocationUpdate(LocalDateTime.now());
                    
                    Driver updatedDriver = driverService.updateDriver(id, driver);
                    updatedDriver.setPassword(null);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", gpsEnabled ? "GPS enabled" : "GPS disabled");
                    response.put("data", updatedDriver);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Driver not found");
                    return ResponseEntity.badRequest().body(response);
                });
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to toggle GPS: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
