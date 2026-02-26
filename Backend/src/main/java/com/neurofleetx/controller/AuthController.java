package com.neurofleetx.controller;

import com.neurofleetx.entity.Driver;
import com.neurofleetx.entity.FleetManager;
import com.neurofleetx.service.DriverService;
import com.neurofleetx.service.FleetManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private DriverService driverService;
    
    @Autowired
    private FleetManagerService fleetManagerService;
    
    // Fleet Manager Signup
    @PostMapping("/fleet-manager/signup")
    public ResponseEntity<Map<String, Object>> fleetManagerSignup(@RequestBody FleetManager fleetManager) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate required fields
            if (fleetManager.getUsername() == null || fleetManager.getUsername().isEmpty()) {
                response.put("success", false);
                response.put("message", "Username is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (fleetManager.getPassword() == null || fleetManager.getPassword().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (fleetManager.getEmail() == null || fleetManager.getEmail().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (fleetManager.getFleetId() == null || fleetManager.getFleetId().isEmpty()) {
                response.put("success", false);
                response.put("message", "Fleet ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            FleetManager savedFleetManager = fleetManagerService.createFleetManager(fleetManager);
            
            // Remove password from response
            savedFleetManager.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Fleet manager registered successfully");
            response.put("user", savedFleetManager);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Driver Signup - Store directly in Driver database
    @PostMapping("/driver/signup")
    public ResponseEntity<Map<String, Object>> driverSignup(@RequestBody Driver driver) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Driver signup request received: " + driver.getUsername());
            
            // Validate required fields
            if (driver.getUsername() == null || driver.getUsername().isEmpty()) {
                response.put("success", false);
                response.put("message", "Username is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (driver.getPassword() == null || driver.getPassword().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (driver.getLicenseNumber() == null || driver.getLicenseNumber().isEmpty()) {
                response.put("success", false);
                response.put("message", "License number is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Set default values if not provided
            if (driver.getStatus() == null) {
                driver.setStatus("active");
            }
            if (driver.getRating() == null) {
                driver.setRating(5.0);
            }
            
            // Create Driver entity
            Driver savedDriver = driverService.createDriver(driver);
            System.out.println("Driver created successfully with ID: " + savedDriver.getId());
            
            // Remove password from response
            savedDriver.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Driver registered successfully");
            response.put("user", savedDriver);
            response.put("driver", savedDriver);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Driver signup error: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Fleet Manager Login
    @PostMapping("/fleet-manager/login")
    public ResponseEntity<Map<String, Object>> fleetManagerLogin(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        
        String username = loginData.get("username");
        String fleetId = loginData.get("fleetId");
        String password = loginData.get("password");
        
        FleetManager fleetManager = fleetManagerService.authenticateFleetManager(username, fleetId, password);
        
        if (fleetManager != null) {
            // Remove password from response
            fleetManager.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", fleetManager);
            response.put("token", "dummy-token-" + fleetManager.getId()); // Simple token for demo
            
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return ResponseEntity.status(401).body(response);
        }
    }
    
    // Driver Login - Authenticate from Driver database
    @PostMapping("/driver/login")
    public ResponseEntity<Map<String, Object>> driverLogin(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        
        String username = loginData.get("username");
        String licenseNumber = loginData.get("licenseNumber");
        String password = loginData.get("password");
        
        Driver driver = driverService.authenticateDriver(username, licenseNumber, password);
        
        if (driver != null) {
            // Remove password from response
            driver.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", driver);
            response.put("token", "dummy-token-" + driver.getId()); // Simple token for demo
            
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return ResponseEntity.status(401).body(response);
        }
    }
    
    // Get all fleet managers
    @GetMapping("/fleet-managers")
    public ResponseEntity<Map<String, Object>> getAllFleetManagers() {
        List<FleetManager> fleetManagers = fleetManagerService.getAllFleetManagers();
        
        // Remove passwords from response
        fleetManagers.forEach(fm -> fm.setPassword(null));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", fleetManagers);
        
        return ResponseEntity.ok(response);
    }
    
    // Get all drivers - Fetch from Driver database
    @GetMapping("/drivers")
    public ResponseEntity<Map<String, Object>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        
        // Remove passwords from response
        drivers.forEach(driver -> driver.setPassword(null));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", drivers);
        
        return ResponseEntity.ok(response);
    }
    
    // Change Password
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> passwordData) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = passwordData.get("username");
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            String userType = passwordData.get("userType"); // "fleet_manager" or "driver"

            // Validate input
            if (username == null || username.isEmpty() ||
                currentPassword == null || currentPassword.isEmpty() ||
                newPassword == null || newPassword.isEmpty()) {
                response.put("success", false);
                response.put("message", "Username, current password, and new password are required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate new password length
            if (newPassword.length() < 8) {
                response.put("success", false);
                response.put("message", "New password must be at least 8 characters long");
                return ResponseEntity.badRequest().body(response);
            }

            boolean success = false;

            // Try fleet manager first
            if ("fleet_manager".equals(userType) || userType == null) {
                try {
                    success = fleetManagerService.changePassword(username, currentPassword, newPassword);
                } catch (Exception e) {
                    // Fleet manager not found, continue to check driver
                }
            }

            // If not a fleet manager or userType is driver, try driver
            if (!success && ("driver".equals(userType) || userType == null)) {
                // For drivers, we need license number for authentication
                String licenseNumber = passwordData.get("licenseNumber");
                if (licenseNumber != null && !licenseNumber.isEmpty()) {
                    // This is a simplified approach - in a real system you'd want to authenticate the driver first
                    // For now, we'll assume the driver is authenticated and just change the password
                    // This should be improved with proper authentication
                    response.put("success", false);
                    response.put("message", "Driver password change not implemented yet");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            if (success) {
                response.put("success", true);
                response.put("message", "Password changed successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Current password is incorrect or user not found");
                return ResponseEntity.status(401).body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
