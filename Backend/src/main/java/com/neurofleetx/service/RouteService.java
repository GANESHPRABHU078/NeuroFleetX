package com.neurofleetx.service;

import com.neurofleetx.entity.Route;
import com.neurofleetx.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public List<Route> getRoutesByDriver(String driverId) {
        try {
            if (driverId == null || driverId.trim().isEmpty()) {
                return new java.util.ArrayList<>();
            }
            List<Route> routes = routeRepository.findByDriverId(driverId);
            return routes != null ? routes : new java.util.ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error in getRoutesByDriver for driverId: " + driverId);
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }

    public List<Route> getRoutesByDriverAndStatus(String driverId, String status) {
        return routeRepository.findByDriverIdAndStatus(driverId, status);
    }

    public List<Route> getRoutesByStatus(String status) {
        return routeRepository.findByStatus(status);
    }

    public Optional<Route> getRouteById(String id) {
        return routeRepository.findById(id);
    }

    public Optional<Route> getCurrentRouteForDriver(String driverId) {
        return routeRepository.findFirstByDriverIdAndStatus(driverId, "in_progress");
    }

    public Route createRoute(Route route, String createdByUsername) {
        route.setAssignedAt(LocalDateTime.now());
        route.setCreatedByUsername(createdByUsername);
        return routeRepository.save(route);
    }

    public Route assignRouteToDriver(String routeId, String driverId, String driverName, String assignedByUsername) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found with id: " + routeId));

        route.setDriverId(driverId);
        route.setDriverName(driverName);
        route.setAssignedByUsername(assignedByUsername);
        route.setStatus("assigned");
        route.setAssignedAt(LocalDateTime.now());

        return routeRepository.save(route);
    }

    public Route startTrip(String routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found with id: " + routeId));

        if (!"assigned".equals(route.getStatus())) {
            throw new RuntimeException("Route must be in 'assigned' status to start trip");
        }

        route.setStatus("in_progress");
        route.setStartedAt(LocalDateTime.now());

        return routeRepository.save(route);
    }

    public Route endTrip(String routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found with id: " + routeId));

        if (!"in_progress".equals(route.getStatus())) {
            throw new RuntimeException("Route must be in 'in_progress' status to end trip");
        }

        route.setStatus("completed");
        route.setCompletedAt(LocalDateTime.now());

        // Calculate actual duration if started time is available
        if (route.getStartedAt() != null) {
            long minutes = ChronoUnit.MINUTES.between(route.getStartedAt(), route.getCompletedAt());
            route.setActualDuration((int) minutes);
        }

        return routeRepository.save(route);
    }

    public Route updateRoute(String id, Route routeDetails) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found with id: " + id));

        route.setStartLocationName(routeDetails.getStartLocationName());
        route.setStartLatitude(routeDetails.getStartLatitude());
        route.setStartLongitude(routeDetails.getStartLongitude());
        route.setEndLocationName(routeDetails.getEndLocationName());
        route.setEndLatitude(routeDetails.getEndLatitude());
        route.setEndLongitude(routeDetails.getEndLongitude());
        route.setDistance(routeDetails.getDistance());
        route.setEstimatedDuration(routeDetails.getEstimatedDuration());
        route.setNotes(routeDetails.getNotes());

        return routeRepository.save(route);
    }

    public void deleteRoute(String id) {
        routeRepository.deleteById(id);
    }

    public Route cancelRoute(String routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found with id: " + routeId));

        route.setStatus("cancelled");
        return routeRepository.save(route);
    }
}