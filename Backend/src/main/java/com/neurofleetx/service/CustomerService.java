package com.neurofleetx.service;

import com.neurofleetx.entity.Customer;
import com.neurofleetx.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    // Create new customer
    public Customer createCustomer(Customer customer) {
        // Check if username already exists
        if (customerRepository.existsByUsername(customer.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());
        return customerRepository.save(customer);
    }
    
    // Get all customers
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    // Get customer by ID
    public Optional<Customer> getCustomerById(String id) {
        return customerRepository.findById(id);
    }
    
    // Get customer by username
    public Optional<Customer> getCustomerByUsername(String username) {
        return customerRepository.findByUsername(username);
    }
    
    // Get customer by email
    public Optional<Customer> getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email);
    }
    
    // Login customer
    public Customer loginCustomer(String usernameOrEmail, String password) {
        Optional<Customer> customerOpt = customerRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        
        if (customerOpt.isEmpty()) {
            throw new RuntimeException("Customer not found");
        }
        
        Customer customer = customerOpt.get();
        
        if (!customer.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        
        if (!"active".equals(customer.getStatus())) {
            throw new RuntimeException("Account is " + customer.getStatus());
        }
        
        // Update last login
        customer.setLastLogin(LocalDateTime.now());
        return customerRepository.save(customer);
    }
    
    // Update customer
    public Customer updateCustomer(String id, Customer updatedCustomer) {
        Optional<Customer> existingCustomerOpt = customerRepository.findById(id);
        
        if (existingCustomerOpt.isEmpty()) {
            throw new RuntimeException("Customer not found");
        }
        
        Customer existingCustomer = existingCustomerOpt.get();
        
        // Update fields
        if (updatedCustomer.getName() != null) {
            existingCustomer.setName(updatedCustomer.getName());
        }
        if (updatedCustomer.getEmail() != null && !updatedCustomer.getEmail().equals(existingCustomer.getEmail())) {
            if (customerRepository.existsByEmail(updatedCustomer.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            existingCustomer.setEmail(updatedCustomer.getEmail());
            existingCustomer.setEmailVerified(false);
        }
        if (updatedCustomer.getPhoneNumber() != null) {
            existingCustomer.setPhoneNumber(updatedCustomer.getPhoneNumber());
        }
        if (updatedCustomer.getAddress() != null) {
            existingCustomer.setAddress(updatedCustomer.getAddress());
        }
        if (updatedCustomer.getCity() != null) {
            existingCustomer.setCity(updatedCustomer.getCity());
        }
        if (updatedCustomer.getState() != null) {
            existingCustomer.setState(updatedCustomer.getState());
        }
        if (updatedCustomer.getZipCode() != null) {
            existingCustomer.setZipCode(updatedCustomer.getZipCode());
        }
        if (updatedCustomer.getCountry() != null) {
            existingCustomer.setCountry(updatedCustomer.getCountry());
        }
        if (updatedCustomer.getIdType() != null) {
            existingCustomer.setIdType(updatedCustomer.getIdType());
        }
        if (updatedCustomer.getIdNumber() != null) {
            existingCustomer.setIdNumber(updatedCustomer.getIdNumber());
        }
        if (updatedCustomer.getPaymentMethod() != null) {
            existingCustomer.setPaymentMethod(updatedCustomer.getPaymentMethod());
        }
        if (updatedCustomer.getBio() != null) {
            existingCustomer.setBio(updatedCustomer.getBio());
        }
        if (updatedCustomer.getProfilePicture() != null) {
            existingCustomer.setProfilePicture(updatedCustomer.getProfilePicture());
        }
        
        existingCustomer.setUpdatedAt(LocalDateTime.now());
        return customerRepository.save(existingCustomer);
    }
    
    // Change password
    public Customer changePassword(String id, String oldPassword, String newPassword) {
        Optional<Customer> customerOpt = customerRepository.findById(id);
        
        if (customerOpt.isEmpty()) {
            throw new RuntimeException("Customer not found");
        }
        
        Customer customer = customerOpt.get();
        
        if (!customer.getPassword().equals(oldPassword)) {
            throw new RuntimeException("Invalid old password");
        }
        
        customer.setPassword(newPassword);
        customer.setUpdatedAt(LocalDateTime.now());
        return customerRepository.save(customer);
    }
    
    // Update booking statistics
    public Customer updateBookingStats(String customerId, String action) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        
        if (customerOpt.isEmpty()) {
            throw new RuntimeException("Customer not found");
        }
        
        Customer customer = customerOpt.get();
        
        switch (action) {
            case "create":
                customer.setTotalBookings(customer.getTotalBookings() + 1);
                customer.setActiveBookings(customer.getActiveBookings() + 1);
                break;
            case "complete":
                customer.setActiveBookings(customer.getActiveBookings() - 1);
                customer.setCompletedBookings(customer.getCompletedBookings() + 1);
                break;
            case "cancel":
                customer.setActiveBookings(customer.getActiveBookings() - 1);
                customer.setCancelledBookings(customer.getCancelledBookings() + 1);
                break;
        }
        
        return customerRepository.save(customer);
    }
    
    // Delete customer
    public void deleteCustomer(String id) {
        customerRepository.deleteById(id);
    }
    
    // Get customers by status
    public List<Customer> getCustomersByStatus(String status) {
        return customerRepository.findByStatus(status);
    }
    
    // Suspend customer
    public Customer suspendCustomer(String id) {
        Optional<Customer> customerOpt = customerRepository.findById(id);
        
        if (customerOpt.isEmpty()) {
            throw new RuntimeException("Customer not found");
        }
        
        Customer customer = customerOpt.get();
        customer.setStatus("suspended");
        customer.setUpdatedAt(LocalDateTime.now());
        return customerRepository.save(customer);
    }
    
    // Activate customer
    public Customer activateCustomer(String id) {
        Optional<Customer> customerOpt = customerRepository.findById(id);
        
        if (customerOpt.isEmpty()) {
            throw new RuntimeException("Customer not found");
        }
        
        Customer customer = customerOpt.get();
        customer.setStatus("active");
        customer.setUpdatedAt(LocalDateTime.now());
        return customerRepository.save(customer);
    }
}
