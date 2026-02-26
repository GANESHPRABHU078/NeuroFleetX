package com.neurofleetx.controller;

import com.neurofleetx.entity.RouteOptimization;
import com.neurofleetx.service.RouteOptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/route-optimization")
@CrossOrigin(origins = "*")
public class RouteOptimizationController {

    @Autowired
    private RouteOptimizationService routeOptimizationService;

    // Get all route optimizations
    @GetMapping
    public ResponseEntity<List<RouteOptimization>> getAllRouteOptimizations() {
        List<RouteOptimization> optimizations = routeOptimizationService.getAllRouteOptimizations();
        return ResponseEntity.ok(optimizations);
    }

    // Get route optimization by ID
    @GetMapping("/{id}")
    public ResponseEntity<RouteOptimization> getRouteOptimizationById(@PathVariable String id) {
        Optional<RouteOptimization> optimization = routeOptimizationService.getRouteOptimizationById(id);
        return optimization.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    // Get route optimizations by route ID
    @GetMapping("/route/{routeId}")
    public ResponseEntity<List<RouteOptimization>> getByRouteId(@PathVariable String routeId) {
        List<RouteOptimization> optimizations = routeOptimizationService.getByRouteId(routeId);
        return ResponseEntity.ok(optimizations);
    }

    // Get route optimizations by vehicle ID
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<RouteOptimization>> getByVehicleId(@PathVariable String vehicleId) {
        List<RouteOptimization> optimizations = routeOptimizationService.getByVehicleId(vehicleId);
        return ResponseEntity.ok(optimizations);
    }

    // Get route optimizations by driver ID
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<RouteOptimization>> getByDriverId(@PathVariable String driverId) {
        List<RouteOptimization> optimizations = routeOptimizationService.getByDriverId(driverId);
        return ResponseEntity.ok(optimizations);
    }

    // Get route optimizations by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RouteOptimization>> getByStatus(@PathVariable String status) {
        List<RouteOptimization> optimizations = routeOptimizationService.getByStatus(status);
        return ResponseEntity.ok(optimizations);
    }

    // Create optimized route
    @PostMapping
    public ResponseEntity<RouteOptimization> createOptimizedRoute(@RequestBody RouteOptimization routeOptimization) {
        RouteOptimization created = routeOptimizationService.createOptimizedRoute(routeOptimization);
        return ResponseEntity.ok(created);
    }

    // Update route optimization
    @PutMapping("/{id}")
    public ResponseEntity<RouteOptimization> updateRouteOptimization(
            @PathVariable String id,
            @RequestBody RouteOptimization routeOptimization) {
        RouteOptimization updated = routeOptimizationService.updateRouteOptimization(id, routeOptimization);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete route optimization
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRouteOptimization(@PathVariable String id) {
        routeOptimizationService.deleteRouteOptimization(id);
        return ResponseEntity.ok().build();
    }

    // Get optimization statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getOptimizationStatistics() {
        Map<String, Object> stats = routeOptimizationService.getOptimizationStatistics();
        return ResponseEntity.ok(stats);
    }

    // Generate mock data (for testing)
    @PostMapping("/generate-mock/{count}")
    public ResponseEntity<List<RouteOptimization>> generateMockData(@PathVariable int count) {
        List<RouteOptimization> mockData = routeOptimizationService.generateMockOptimizedRoutes(count);
        return ResponseEntity.ok(mockData);
    }
}
