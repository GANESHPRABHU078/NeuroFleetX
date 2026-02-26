package com.neurofleetx.repository;

import com.neurofleetx.entity.VehicleMaintenance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleMaintenanceRepository extends MongoRepository<VehicleMaintenance, String> {
    Optional<VehicleMaintenance> findByVehicleId(String vehicleId);
    List<VehicleMaintenance> findByHealthStatus(String healthStatus);
    List<VehicleMaintenance> findByRiskLevel(String riskLevel);
    List<VehicleMaintenance> findByHealthScoreLessThan(int healthScore);
}
