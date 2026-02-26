package com.neurofleetx.service;

import com.neurofleetx.entity.Driver;
import com.neurofleetx.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class DriverService {
    
    @Autowired
    private DriverRepository driverRepository;
    
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }
    
    public Optional<Driver> getDriverById(String id) {
        return driverRepository.findById(id);
    }
    
    public Driver createDriver(Driver driver) {
        // Check if username already exists
        if (driver.getUsername() != null) {
            Optional<Driver> existing = driverRepository.findByUsername(driver.getUsername());
            if (existing.isPresent()) {
                throw new RuntimeException("Username already exists");
            }
        }
        
        // Check if license number already exists
        if (driver.getLicenseNumber() != null) {
            Optional<Driver> existing = driverRepository.findByLicenseNumber(driver.getLicenseNumber());
            if (existing.isPresent()) {
                throw new RuntimeException("License number already registered");
            }
        }
        
        return driverRepository.save(driver);
    }
    
    public Driver authenticateDriver(String username, String licenseNumber, String password) {
        Optional<Driver> driverOpt = driverRepository.findByUsernameAndLicenseNumber(username, licenseNumber);
        
        if (driverOpt.isPresent()) {
            Driver driver = driverOpt.get();
            // Simple password comparison (in production, use proper password hashing)
            if (driver.getPassword() != null && driver.getPassword().equals(password)) {
                return driver;
            }
        }
        
        return null;
    }
    
    public Driver updateDriver(String id, Driver driverDetails) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
        
        // Check if username is being changed and if it's already taken by another driver
        if (driverDetails.getUsername() != null && !driverDetails.getUsername().equals(driver.getUsername())) {
            Optional<Driver> existing = driverRepository.findByUsername(driverDetails.getUsername());
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                throw new RuntimeException("Username already exists");
            }
        }
        
        driver.setName(driverDetails.getName());
        driver.setUsername(driverDetails.getUsername());
        driver.setLicenseNumber(driverDetails.getLicenseNumber());
        driver.setPhone(driverDetails.getPhone());
        driver.setEmail(driverDetails.getEmail());
        driver.setLatitude(driverDetails.getLatitude());
        driver.setLongitude(driverDetails.getLongitude());
        
        if (driverDetails.getStatus() != null) {
            driver.setStatus(driverDetails.getStatus());
        }
        if (driverDetails.getRating() != null) {
            driver.setRating(driverDetails.getRating());
        }
        
        return driverRepository.save(driver);
    }
    
    public void deleteDriver(String id) {
        driverRepository.deleteById(id);
    }
}
