package com.neurofleetx.controller;

import com.neurofleetx.entity.Route;
import com.neurofleetx.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
public class RouteController {

    @Autowired
    private RouteService routeService;

    // Get all routes
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRoutes() {
        List<Route> routes = routeService.getAllRoutes();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", routes);
        return ResponseEntity.ok(response);
    }

    // Get route by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRouteById(@PathVariable("id") String id) {
        return routeService.getRouteById(id)
                .map(route -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", route);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get routes by driver
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<Map<String, Object>> getRoutesByDriver(@PathVariable("driverId") String driverId) {
        try {
            System.out.println("Fetching routes for driver ID: " + driverId);
            List<Route> routes = routeService.getRoutesByDriver(driverId);
            System.out.println("Found " + (routes != null ? routes.size() : 0) + " routes");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", routes != null ? routes : new java.util.ArrayList<>());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("ERROR in getRoutesByDriver for driverId: " + driverId);
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", new java.util.ArrayList<>());
            response.put("message", "No routes found");
            return ResponseEntity.ok(response);
        }
    }

    // Get current route for driver
    @GetMapping("/driver/{driverId}/current")
    public ResponseEntity<Map<String, Object>> getCurrentRouteForDriver(@PathVariable("driverId") String driverId) {
        return routeService.getCurrentRouteForDriver(driverId)
                .map(route -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", route);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get routes by status
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getRoutesByStatus(@PathVariable String status) {
        List<Route> routes = routeService.getRoutesByStatus(status);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", routes);
        return ResponseEntity.ok(response);
    }

    // Create new route
    @PostMapping
    public ResponseEntity<Map<String, Object>> createRoute(@RequestBody Map<String, Object> requestData) {
        try {
            // Extract route data from the request
            Route route = new Route();
            
            // Extract driver information
            if (requestData.containsKey("driverId")) {
                route.setDriverId((String) requestData.get("driverId"));
            }
            if (requestData.containsKey("driverName")) {
                route.setDriverName((String) requestData.get("driverName"));
            }
            if (requestData.containsKey("driverUsername")) {
                route.setDriverUsername((String) requestData.get("driverUsername"));
            }
            
            // Extract basic route information
            if (requestData.containsKey("startLocationName")) {
                route.setStartLocationName((String) requestData.get("startLocationName"));
            }
            if (requestData.containsKey("startLatitude")) {
                route.setStartLatitude(((Number) requestData.get("startLatitude")).doubleValue());
            }
            if (requestData.containsKey("startLongitude")) {
                route.setStartLongitude(((Number) requestData.get("startLongitude")).doubleValue());
            }
            if (requestData.containsKey("endLocationName")) {
                route.setEndLocationName((String) requestData.get("endLocationName"));
            }
            if (requestData.containsKey("endLatitude")) {
                route.setEndLatitude(((Number) requestData.get("endLatitude")).doubleValue());
            }
            if (requestData.containsKey("endLongitude")) {
                route.setEndLongitude(((Number) requestData.get("endLongitude")).doubleValue());
            }
            if (requestData.containsKey("distance")) {
                route.setDistance(((Number) requestData.get("distance")).doubleValue());
            }
            if (requestData.containsKey("estimatedDuration")) {
                route.setEstimatedDuration(((Number) requestData.get("estimatedDuration")).intValue());
            }
            if (requestData.containsKey("notes")) {
                route.setNotes((String) requestData.get("notes"));
            }
            
            // Extract username
            String createdByUsername = (String) requestData.get("createdByUsername");
            if (createdByUsername == null || createdByUsername.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "createdByUsername is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Route savedRoute = routeService.createRoute(route, createdByUsername);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Route created successfully");
            response.put("data", savedRoute);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Assign route to driver
    @PostMapping("/{routeId}/assign")
    public ResponseEntity<Map<String, Object>> assignRouteToDriver(
            @PathVariable String routeId,
            @RequestBody Map<String, String> assignmentData) {
        try {
            String driverId = assignmentData.get("driverId");
            String driverName = assignmentData.get("driverName");
            String assignedByUsername = assignmentData.get("assignedByUsername");

            if (assignedByUsername == null || assignedByUsername.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "assignedByUsername is required");
                return ResponseEntity.badRequest().body(response);
            }

            Route updatedRoute = routeService.assignRouteToDriver(routeId, driverId, driverName, assignedByUsername);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Route assigned successfully");
            response.put("data", updatedRoute);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Start trip
    @PostMapping("/{routeId}/start")
    public ResponseEntity<Map<String, Object>> startTrip(@PathVariable("routeId") String routeId) {
        try {
            Route updatedRoute = routeService.startTrip(routeId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Trip started successfully");
            response.put("data", updatedRoute);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // End trip
    @PostMapping("/{routeId}/end")
    public ResponseEntity<Map<String, Object>> endTrip(@PathVariable("routeId") String routeId) {
        try {
            Route updatedRoute = routeService.endTrip(routeId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Trip completed successfully");
            response.put("data", updatedRoute);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Update route
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRoute(@PathVariable String id, @RequestBody Route routeDetails) {
        try {
            Route updatedRoute = routeService.updateRoute(id, routeDetails);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Route updated successfully");
            response.put("data", updatedRoute);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Cancel route
    @PostMapping("/{routeId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelRoute(@PathVariable String routeId) {
        try {
            Route cancelledRoute = routeService.cancelRoute(routeId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Route cancelled successfully");
            response.put("data", cancelledRoute);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Delete route
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRoute(@PathVariable String id) {
        try {
            routeService.deleteRoute(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Route deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}