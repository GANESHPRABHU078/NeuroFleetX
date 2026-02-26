package com.neurofleetx.service;

import com.neurofleetx.entity.RouteOptimization;
import com.neurofleetx.entity.RouteOptimization.Location;
import com.neurofleetx.repository.RouteOptimizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RouteOptimizationService {

    @Autowired
    private RouteOptimizationRepository routeOptimizationRepository;

    // Get all route optimizations
    public List<RouteOptimization> getAllRouteOptimizations() {
        return routeOptimizationRepository.findAll();
    }

    // Get route optimization by ID
    public Optional<RouteOptimization> getRouteOptimizationById(String id) {
        return routeOptimizationRepository.findById(id);
    }

    // Get route optimizations by route ID
    public List<RouteOptimization> getByRouteId(String routeId) {
        return routeOptimizationRepository.findByRouteId(routeId);
    }

    // Get route optimizations by vehicle ID
    public List<RouteOptimization> getByVehicleId(String vehicleId) {
        return routeOptimizationRepository.findByVehicleId(vehicleId);
    }

    // Get route optimizations by driver ID
    public List<RouteOptimization> getByDriverId(String driverId) {
        return routeOptimizationRepository.findByDriverId(driverId);
    }

    // Get route optimizations by status
    public List<RouteOptimization> getByStatus(String status) {
        return routeOptimizationRepository.findByStatus(status);
    }

    // Create optimized route using AI algorithm
    public RouteOptimization createOptimizedRoute(RouteOptimization routeOptimization) {
        routeOptimization.setCalculatedAt(LocalDateTime.now());
        routeOptimization.setStatus("active");
        
        // Simulate AI optimization calculations
        if (routeOptimization.getOptimizedPath() != null && !routeOptimization.getOptimizedPath().isEmpty()) {
            // Calculate estimated metrics
            calculateRouteMetrics(routeOptimization);
        }
        
        return routeOptimizationRepository.save(routeOptimization);
    }

    // Update route optimization
    public RouteOptimization updateRouteOptimization(String id, RouteOptimization routeOptimization) {
        Optional<RouteOptimization> existing = routeOptimizationRepository.findById(id);
        if (existing.isPresent()) {
            RouteOptimization updated = existing.get();
            updated.setRouteId(routeOptimization.getRouteId());
            updated.setVehicleId(routeOptimization.getVehicleId());
            updated.setDriverId(routeOptimization.getDriverId());
            updated.setOptimizedPath(routeOptimization.getOptimizedPath());
            updated.setStatus(routeOptimization.getStatus());
            updated.setLoadCapacity(routeOptimization.getLoadCapacity());
            updated.setCurrentLoad(routeOptimization.getCurrentLoad());
            
            // Recalculate metrics
            calculateRouteMetrics(updated);
            
            return routeOptimizationRepository.save(updated);
        }
        return null;
    }

    // Delete route optimization
    public void deleteRouteOptimization(String id) {
        routeOptimizationRepository.deleteById(id);
    }

    // Get optimization statistics
    public Map<String, Object> getOptimizationStatistics() {
        List<RouteOptimization> allOptimizations = routeOptimizationRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRoutes", allOptimizations.size());
        stats.put("activeRoutes", routeOptimizationRepository.findByStatus("active").size());
        stats.put("completedRoutes", routeOptimizationRepository.findByStatus("completed").size());
        
        double avgEfficiency = allOptimizations.stream()
            .mapToDouble(RouteOptimization::getFuelEfficiency)
            .average()
            .orElse(0.0);
        stats.put("averageFuelEfficiency", Math.round(avgEfficiency * 100.0) / 100.0);
        
        double totalSavings = allOptimizations.stream()
            .mapToDouble(RouteOptimization::getCostSavings)
            .sum();
        stats.put("totalCostSavings", Math.round(totalSavings * 100.0) / 100.0);
        
        double avgLoadUtilization = allOptimizations.stream()
            .filter(r -> r.getLoadCapacity() > 0)
            .mapToDouble(r -> (double) r.getCurrentLoad() / r.getLoadCapacity() * 100)
            .average()
            .orElse(0.0);
        stats.put("averageLoadUtilization", Math.round(avgLoadUtilization * 100.0) / 100.0);
        
        return stats;
    }

    // Generate mock optimized routes for testing
    public List<RouteOptimization> generateMockOptimizedRoutes(int count) {
        List<RouteOptimization> mockRoutes = new ArrayList<>();
        Random random = new Random();
        
        String[] algorithms = {"Dijkstra", "A* Algorithm", "Genetic Algorithm", "Ant Colony"};
        String[] statuses = {"active", "pending", "completed"};
        
        for (int i = 0; i < count; i++) {
            RouteOptimization route = new RouteOptimization();
            route.setRouteId("ROUTE-" + (1000 + i));
            route.setVehicleId("VEH-" + (100 + random.nextInt(50)));
            route.setDriverId("DRV-" + (200 + random.nextInt(30)));
            
            // Generate mock path
            List<Location> path = new ArrayList<>();
            for (int j = 0; j < 5; j++) {
                Location loc = new Location(
                    12.9 + random.nextDouble() * 0.2,
                    77.5 + random.nextDouble() * 0.2,
                    "Location " + (j + 1),
                    j + 1
                );
                path.add(loc);
            }
            route.setOptimizedPath(path);
            
            route.setEstimatedDistance(20 + random.nextDouble() * 80);
            route.setEstimatedDuration(30 + random.nextDouble() * 120);
            route.setFuelEfficiency(15 + random.nextDouble() * 10);
            route.setLoadCapacity(1000 + random.nextInt(4000));
            route.setCurrentLoad(500 + random.nextInt(3000));
            route.setCostSavings(100 + random.nextDouble() * 500);
            route.setOptimizationAlgorithm(algorithms[random.nextInt(algorithms.length)]);
            route.setStatus(statuses[random.nextInt(statuses.length)]);
            route.setCalculatedAt(LocalDateTime.now().minusHours(random.nextInt(48)));
            
            mockRoutes.add(routeOptimizationRepository.save(route));
        }
        
        return mockRoutes;
    }

    // Helper method to calculate route metrics
    private void calculateRouteMetrics(RouteOptimization route) {
        if (route.getOptimizedPath() == null || route.getOptimizedPath().isEmpty()) {
            return;
        }
        
        // Simulate distance calculation (in reality, use actual GPS coordinates)
        double distance = route.getOptimizedPath().size() * 15.0; // Simplified
        route.setEstimatedDistance(distance);
        
        // Simulate duration calculation
        double duration = distance * 2.5; // minutes
        route.setEstimatedDuration(duration);
        
        // Calculate fuel efficiency
        double fuelEfficiency = 12.0 + (Math.random() * 8.0);
        route.setFuelEfficiency(fuelEfficiency);
        
        // Calculate cost savings (compared to unoptimized route)
        double costSavings = distance * 2.5 * (1 + Math.random() * 0.3);
        route.setCostSavings(costSavings);
    }
}
