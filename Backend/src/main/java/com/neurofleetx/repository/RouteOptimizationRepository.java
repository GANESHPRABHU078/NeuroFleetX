package com.neurofleetx.repository;

import com.neurofleetx.entity.RouteOptimization;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RouteOptimizationRepository extends MongoRepository<RouteOptimization, String> {
    List<RouteOptimization> findByRouteId(String routeId);
    List<RouteOptimization> findByVehicleId(String vehicleId);
    List<RouteOptimization> findByDriverId(String driverId);
    List<RouteOptimization> findByStatus(String status);
}
