package com.neurofleetx.repository;

import com.neurofleetx.entity.Driver;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends MongoRepository<Driver, String> {
    Optional<Driver> findByUsername(String username);
    Optional<Driver> findByUsernameAndLicenseNumber(String username, String licenseNumber);
    Optional<Driver> findByLicenseNumber(String licenseNumber);
}
