package com.neurofleetx.repository;

import com.neurofleetx.entity.FleetManager;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FleetManagerRepository extends MongoRepository<FleetManager, String> {
    Optional<FleetManager> findByUsername(String username);
    Optional<FleetManager> findByEmail(String email);
    Optional<FleetManager> findByUsernameAndFleetId(String username, String fleetId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}