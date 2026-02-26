package com.neurofleetx.service;

import com.neurofleetx.entity.Telemetry;
import com.neurofleetx.repository.TelemetryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class TelemetryService {
    
    @Autowired
    private TelemetryRepository telemetryRepository;
    
    public List<Telemetry> getAllTelemetry() {
        return telemetryRepository.findAll();
    }
    
    public List<Telemetry> getTelemetryByVehicleId(String vehicleId) {
        return telemetryRepository.findByVehicleId(vehicleId);
    }
    
    public Telemetry createTelemetry(Telemetry telemetry) {
        return telemetryRepository.save(telemetry);
    }
    
    public void deleteTelemetry(String id) {
        telemetryRepository.deleteById(id);
    }
}
