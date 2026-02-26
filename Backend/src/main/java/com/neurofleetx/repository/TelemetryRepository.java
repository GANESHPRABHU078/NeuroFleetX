package com.neurofleetx.repository;

import com.neurofleetx.entity.Telemetry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetryRepository extends MongoRepository<Telemetry, String> {
    List<Telemetry> findByVehicleId(String vehicleId);
}
