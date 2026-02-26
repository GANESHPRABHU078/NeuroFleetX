package com.neurofleetx.service;

import com.neurofleetx.entity.User;
import com.neurofleetx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }
    
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public User createUser(User user) {
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return userRepository.save(user);
    }
    
    public User updateUser(String id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setName(userDetails.getName());
        user.setPhone(userDetails.getPhone());
        
        if (userDetails.getLicenseNumber() != null) {
            user.setLicenseNumber(userDetails.getLicenseNumber());
        }
        
        return userRepository.save(user);
    }
    
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
    public User authenticate(String username, String password) {
        Optional<User> user = userRepository.findByUsername(username);
        
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user.get();
        }
        
        return null;
    }
    
    public User authenticateDriver(String username, String licenseNumber, String password) {
        Optional<User> user = userRepository.findByUsername(username);
        
        if (user.isPresent() && 
            user.get().getPassword().equals(password) && 
            licenseNumber.equals(user.get().getLicenseNumber()) &&
            "driver".equals(user.get().getRole())) {
            return user.get();
        }
        
        return null;
    }
    
    public boolean changePassword(String username, String currentPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with username: " + username);
        }
        
        User user = userOptional.get();
        
        // Verify current password
        if (!user.getPassword().equals(currentPassword)) {
            return false;
        }
        
        // Update to new password
        user.setPassword(newPassword);
        userRepository.save(user);
        
        return true;
    }
}
