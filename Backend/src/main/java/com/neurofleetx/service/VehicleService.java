package com.neurofleetx.service;

import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class VehicleService {
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }
    
    public Optional<Vehicle> getVehicleById(String id) {
        return vehicleRepository.findById(id);
    }
    
    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }
    
    public Vehicle updateVehicle(String id, Vehicle vehicleDetails) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        
        vehicle.setVin(vehicleDetails.getVin());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setStatus(vehicleDetails.getStatus());
    // update coordinates if provided
    vehicle.setLatitude(vehicleDetails.getLatitude());
    vehicle.setLongitude(vehicleDetails.getLongitude());
        
        return vehicleRepository.save(vehicle);
    }
    
    public void deleteVehicle(String id) {
        vehicleRepository.deleteById(id);
    }
}
