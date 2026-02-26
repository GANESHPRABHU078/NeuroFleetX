package com.neurofleetx.service;

import com.neurofleetx.entity.FleetManager;
import com.neurofleetx.repository.FleetManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class FleetManagerService {

    @Autowired
    private FleetManagerRepository fleetManagerRepository;

    public List<FleetManager> getAllFleetManagers() {
        return fleetManagerRepository.findAll();
    }

    public Optional<FleetManager> getFleetManagerById(String id) {
        return fleetManagerRepository.findById(id);
    }

    public Optional<FleetManager> getFleetManagerByUsername(String username) {
        return fleetManagerRepository.findByUsername(username);
    }

    public Optional<FleetManager> getFleetManagerByEmail(String email) {
        return fleetManagerRepository.findByEmail(email);
    }

    public FleetManager createFleetManager(FleetManager fleetManager) {
        // Check if username already exists
        if (fleetManagerRepository.existsByUsername(fleetManager.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        // Check if email already exists
        if (fleetManagerRepository.existsByEmail(fleetManager.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return fleetManagerRepository.save(fleetManager);
    }

    public FleetManager updateFleetManager(String id, FleetManager fleetManagerDetails) {
        FleetManager fleetManager = fleetManagerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fleet manager not found with id: " + id));

        fleetManager.setName(fleetManagerDetails.getName());
        fleetManager.setPhone(fleetManagerDetails.getPhone());
        fleetManager.setFleetId(fleetManagerDetails.getFleetId());

        return fleetManagerRepository.save(fleetManager);
    }

    public void deleteFleetManager(String id) {
        fleetManagerRepository.deleteById(id);
    }

    public FleetManager authenticateFleetManager(String username, String fleetId, String password) {
        Optional<FleetManager> fleetManager = fleetManagerRepository.findByUsernameAndFleetId(username, fleetId);

        if (fleetManager.isPresent() &&
            fleetManager.get().getPassword().equals(password)) {
            return fleetManager.get();
        }

        return null;
    }

    public boolean changePassword(String username, String currentPassword, String newPassword) {
        Optional<FleetManager> fleetManagerOptional = fleetManagerRepository.findByUsername(username);

        if (fleetManagerOptional.isEmpty()) {
            throw new RuntimeException("Fleet manager not found with username: " + username);
        }

        FleetManager fleetManager = fleetManagerOptional.get();

        // Verify current password
        if (!fleetManager.getPassword().equals(currentPassword)) {
            return false;
        }

        // Update to new password
        fleetManager.setPassword(newPassword);
        fleetManagerRepository.save(fleetManager);

        return true;
    }
}