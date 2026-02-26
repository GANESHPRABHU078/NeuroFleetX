package com.neurofleetx.repository;

import com.neurofleetx.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
