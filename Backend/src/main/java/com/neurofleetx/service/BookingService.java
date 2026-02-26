package com.neurofleetx.service;

import com.neurofleetx.entity.Booking;
import com.neurofleetx.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByVehicle(String vehicleId) {
        return bookingRepository.findByVehicleId(vehicleId);
    }

    public List<Booking> getBookingsByStatus(String status) {
        return bookingRepository.findByStatus(status);
    }

    public List<Booking> getUpcomingBookings(String userId) {
        return bookingRepository.findUpcomingBookings(userId, LocalDateTime.now());
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    public Booking createBooking(Booking booking) {
        // Validate dates
        if (booking.getStartDate() == null || booking.getEndDate() == null) {
            throw new RuntimeException("Start date and end date are required");
        }

        if (booking.getStartDate().isAfter(booking.getEndDate())) {
            throw new RuntimeException("Start date must be before end date");
        }

        if (booking.getStartDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }

        // Check for conflicting bookings
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            booking.getVehicleId(),
            booking.getStartDate(),
            booking.getEndDate()
        );

        if (!conflicts.isEmpty()) {
            StringBuilder conflictDetails = new StringBuilder("Vehicle is not available for the selected time period. Conflicting bookings: ");
            for (Booking conflict : conflicts) {
                conflictDetails.append(String.format("[%s to %s] ", 
                    conflict.getStartDate().toString(), 
                    conflict.getEndDate().toString()));
            }
            throw new RuntimeException(conflictDetails.toString());
        }

        booking.setCreatedAt(LocalDateTime.now());
        booking.setStatus("pending");
        return bookingRepository.save(booking);
    }

    public boolean isVehicleAvailable(String vehicleId, LocalDateTime startDate, LocalDateTime endDate) {
        // Validate dates
        if (startDate == null || endDate == null) {
            return false;
        }

        if (startDate.isAfter(endDate)) {
            return false;
        }

        if (startDate.isBefore(LocalDateTime.now())) {
            return false;
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(vehicleId, startDate, endDate);
        return conflicts.isEmpty();
    }

    public Booking confirmBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!"pending".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending bookings can be confirmed");
        }

        booking.setStatus("confirmed");
        booking.setConfirmedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking startBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!"confirmed".equals(booking.getStatus())) {
            throw new RuntimeException("Only confirmed bookings can be started");
        }

        booking.setStatus("active");
        return bookingRepository.save(booking);
    }

    public Booking completeBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!"active".equals(booking.getStatus())) {
            throw new RuntimeException("Only active bookings can be completed");
        }

        booking.setStatus("completed");
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if ("completed".equals(booking.getStatus()) || "cancelled".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot cancel completed or already cancelled bookings");
        }

        booking.setStatus("cancelled");
        booking.setCancelledAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(String id, Booking bookingDetails) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        // Only allow updates for pending and confirmed bookings
        if ("active".equals(booking.getStatus()) || "completed".equals(booking.getStatus()) || 
            "cancelled".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot update active, completed, or cancelled bookings");
        }

        // Check for conflicts if dates are being changed
        if (!booking.getStartDate().equals(bookingDetails.getStartDate()) || 
            !booking.getEndDate().equals(bookingDetails.getEndDate())) {
            
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getVehicleId(),
                bookingDetails.getStartDate(),
                bookingDetails.getEndDate()
            );

            // Remove current booking from conflicts
            conflicts.removeIf(b -> b.getId().equals(booking.getId()));

            if (!conflicts.isEmpty()) {
                throw new RuntimeException("Vehicle is not available for the selected time period");
            }
        }

        // Update booking details
        booking.setStartDate(bookingDetails.getStartDate());
        booking.setEndDate(bookingDetails.getEndDate());
        booking.setPurpose(bookingDetails.getPurpose());
        booking.setPickupLocation(bookingDetails.getPickupLocation());
        booking.setDropoffLocation(bookingDetails.getDropoffLocation());
        booking.setContactNumber(bookingDetails.getContactNumber());
        booking.setNotes(bookingDetails.getNotes());

        return bookingRepository.save(booking);
    }

    public Booking assignDriverToBooking(String bookingId, String driverId, String driverName, String routeId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        booking.setAssignedDriverId(driverId);
        booking.setAssignedDriverName(driverName);
        booking.setAssignedRouteId(routeId);
        booking.setAssignedAt(LocalDateTime.now());
        
        // Auto-confirm the booking when driver is assigned
        if ("pending".equals(booking.getStatus())) {
            booking.setStatus("confirmed");
            booking.setConfirmedAt(LocalDateTime.now());
        }

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByDriver(String driverId) {
        try {
            if (driverId == null || driverId.trim().isEmpty()) {
                return new java.util.ArrayList<>();
            }
            List<Booking> bookings = bookingRepository.findByAssignedDriverId(driverId);
            return bookings != null ? bookings : new java.util.ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error in getBookingsByDriver for driverId: " + driverId);
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }

    public void deleteBooking(String id) {
        bookingRepository.deleteById(id);
    }
}
