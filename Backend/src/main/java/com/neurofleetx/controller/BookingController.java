package com.neurofleetx.controller;

import com.neurofleetx.entity.Booking;
import com.neurofleetx.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // Get all bookings
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", bookings);
        return ResponseEntity.ok(response);
    }

    // Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBookingById(@PathVariable("id") String id) {
        return bookingService.getBookingById(id)
                .map(booking -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", booking);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get bookings by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getBookingsByUser(@PathVariable("userId") String userId) {
        List<Booking> bookings = bookingService.getBookingsByUser(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", bookings);
        return ResponseEntity.ok(response);
    }

    // Get bookings by vehicle
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getBookingsByVehicle(@PathVariable("vehicleId") String vehicleId) {
        List<Booking> bookings = bookingService.getBookingsByVehicle(vehicleId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", bookings);
        return ResponseEntity.ok(response);
    }

    // Get active/upcoming bookings for a vehicle
    @GetMapping("/vehicle/{vehicleId}/active")
    public ResponseEntity<Map<String, Object>> getActiveBookingsByVehicle(@PathVariable("vehicleId") String vehicleId) {
        List<Booking> allBookings = bookingService.getBookingsByVehicle(vehicleId);
        List<Booking> activeBookings = allBookings.stream()
            .filter(b -> b.getStatus().matches("pending|confirmed|active"))
            .filter(b -> b.getEndDate().isAfter(LocalDateTime.now()))
            .toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", activeBookings);
        return ResponseEntity.ok(response);
    }

    // Get bookings by status
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getBookingsByStatus(@PathVariable String status) {
        List<Booking> bookings = bookingService.getBookingsByStatus(status);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", bookings);
        return ResponseEntity.ok(response);
    }

    // Get upcoming bookings for a user
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<Map<String, Object>> getUpcomingBookings(@PathVariable String userId) {
        List<Booking> bookings = bookingService.getUpcomingBookings(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", bookings);
        return ResponseEntity.ok(response);
    }

    // Check vehicle availability
    @PostMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(@RequestBody Map<String, Object> availabilityData) {
        try {
            String vehicleId = (String) availabilityData.get("vehicleId");
            String startDateStr = (String) availabilityData.get("startDate");
            String endDateStr = (String) availabilityData.get("endDate");

            if (vehicleId == null || startDateStr == null || endDateStr == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("available", false);
                response.put("message", "Vehicle ID, start date, and end date are required");
                return ResponseEntity.badRequest().body(response);
            }

            // Parse ISO 8601 datetime strings (handles both with and without timezone)
            LocalDateTime startDate = parseDateTime(startDateStr);
            LocalDateTime endDate = parseDateTime(endDateStr);
            
            if (startDate == null || endDate == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("available", false);
                response.put("message", "Invalid date format. Please use ISO 8601 format.");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate dates
            if (startDate.isAfter(endDate)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("available", false);
                response.put("message", "Start date must be before end date");
                return ResponseEntity.badRequest().body(response);
            }

            if (startDate.isBefore(LocalDateTime.now())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("available", false);
                response.put("message", "Start date cannot be in the past");
                return ResponseEntity.badRequest().body(response);
            }

            boolean isAvailable = bookingService.isVehicleAvailable(vehicleId, startDate, endDate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("available", isAvailable);
            
            if (isAvailable) {
                response.put("message", "✓ Vehicle is available for the selected dates");
            } else {
                // Get conflicting bookings to show details
                List<Booking> conflicts = bookingService.getBookingsByVehicle(vehicleId).stream()
                    .filter(b -> b.getStatus().matches("pending|confirmed|active"))
                    .filter(b -> b.getStartDate().isBefore(endDate) && b.getEndDate().isAfter(startDate))
                    .toList();
                
                response.put("message", "✗ Vehicle is not available for the selected dates");
                response.put("conflictCount", conflicts.size());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("available", false);
            response.put("message", "Error checking availability: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Create new booking
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Booking booking) {
        try {
            Booking savedBooking = bookingService.createBooking(booking);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking created successfully");
            response.put("data", savedBooking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Confirm booking
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirmBooking(@PathVariable String id) {
        try {
            Booking booking = bookingService.confirmBooking(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking confirmed successfully");
            response.put("data", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Start booking
    @PutMapping("/{id}/start")
    public ResponseEntity<Map<String, Object>> startBooking(@PathVariable String id) {
        try {
            Booking booking = bookingService.startBooking(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking started successfully");
            response.put("data", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Complete booking
    @PutMapping("/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeBooking(@PathVariable String id) {
        try {
            Booking booking = bookingService.completeBooking(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking completed successfully");
            response.put("data", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Cancel booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable String id) {
        try {
            Booking booking = bookingService.cancelBooking(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking cancelled successfully");
            response.put("data", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Assign driver and route to booking
    @PutMapping("/{id}/assign-driver")
    public ResponseEntity<Map<String, Object>> assignDriverToBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> assignmentData) {
        try {
            String driverId = assignmentData.get("driverId");
            String driverName = assignmentData.get("driverName");
            String routeId = assignmentData.get("routeId");

            Booking booking = bookingService.assignDriverToBooking(id, driverId, driverName, routeId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Driver and route assigned successfully");
            response.put("data", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get bookings by assigned driver
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<Map<String, Object>> getBookingsByDriver(@PathVariable("driverId") String driverId) {
        try {
            System.out.println("Fetching bookings for driver ID: " + driverId);
            List<Booking> bookings = bookingService.getBookingsByDriver(driverId);
            System.out.println("Found " + (bookings != null ? bookings.size() : 0) + " bookings");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", bookings != null ? bookings : new ArrayList<>());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("ERROR in getBookingsByDriver for driverId: " + driverId);
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", new ArrayList<>());
            response.put("message", "No bookings found");
            return ResponseEntity.ok(response);
        }
    }

    // Update booking
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBooking(
            @PathVariable String id,
            @RequestBody Booking bookingDetails) {
        try {
            Booking updatedBooking = bookingService.updateBooking(id, bookingDetails);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking updated successfully");
            response.put("data", updatedBooking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Delete booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBooking(@PathVariable String id) {
        try {
            bookingService.deleteBooking(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Helper method to parse ISO 8601 datetime strings
    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            // Try to parse as ZonedDateTime first (handles ISO 8601 with timezone like "2025-11-21T08:00:00.000Z")
            return ZonedDateTime.parse(dateTimeStr).toLocalDateTime();
        } catch (Exception e) {
            try {
                // Fall back to LocalDateTime parsing if ZonedDateTime fails
                return LocalDateTime.parse(dateTimeStr);
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
