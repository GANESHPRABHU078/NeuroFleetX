package com.neurofleetx.repository;

import com.neurofleetx.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    List<Booking> findByUserId(String userId);
    
    List<Booking> findByVehicleId(String vehicleId);
    
    List<Booking> findByStatus(String status);
    
    List<Booking> findByUserIdAndStatus(String userId, String status);
    
    List<Booking> findByVehicleIdAndStatus(String vehicleId, String status);
    
    List<Booking> findByAssignedDriverId(String driverId);
    
    // Find bookings for a vehicle within a date range
    // This query finds any bookings that overlap with the requested time period
    // Two date ranges overlap if: (StartA <= EndB) AND (EndA >= StartB)
    @Query("{ 'vehicleId': ?0, 'status': { $in: ['pending', 'confirmed', 'active'] }, " +
           "'startDate': { $lt: ?2 }, 'endDate': { $gt: ?1 } }")
    List<Booking> findConflictingBookings(String vehicleId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find upcoming bookings
    @Query("{ 'userId': ?0, 'startDate': { $gte: ?1 }, 'status': { $in: ['pending', 'confirmed'] } }")
    List<Booking> findUpcomingBookings(String userId, LocalDateTime now);
}
