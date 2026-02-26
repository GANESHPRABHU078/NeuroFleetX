package com.neurofleetx.controller;

import com.neurofleetx.entity.Customer;
import com.neurofleetx.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {
    
    @Autowired
    private CustomerService customerService;
    
    // Customer signup
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody Customer customer) {
        Map<String, Object> response = new HashMap<>();
        try {
            Customer createdCustomer = customerService.createCustomer(customer);
            // Remove password from response
            createdCustomer.setPassword(null);
            response.put("success", true);
            response.put("data", createdCustomer);
            response.put("message", "Customer registered successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Customer login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        try {
            String usernameOrEmail = credentials.get("username");
            String password = credentials.get("password");
            
            Customer customer = customerService.loginCustomer(usernameOrEmail, password);
            // Remove password from response
            customer.setPassword(null);
            
            response.put("success", true);
            response.put("data", customer);
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Get all customers
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCustomers() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Customer> customers = customerService.getAllCustomers();
            // Remove passwords from response
            customers.forEach(customer -> customer.setPassword(null));
            response.put("success", true);
            response.put("data", customers);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Get customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCustomerById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Customer> customer = customerService.getCustomerById(id);
            if (customer.isPresent()) {
                Customer customerData = customer.get();
                customerData.setPassword(null);
                response.put("success", true);
                response.put("data", customerData);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Customer not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Update customer
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCustomer(@PathVariable String id, @RequestBody Customer customer) {
        Map<String, Object> response = new HashMap<>();
        try {
            Customer updatedCustomer = customerService.updateCustomer(id, customer);
            updatedCustomer.setPassword(null);
            response.put("success", true);
            response.put("data", updatedCustomer);
            response.put("message", "Customer updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Change password
    @PutMapping("/{id}/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable String id, 
            @RequestBody Map<String, String> passwordData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            
            Customer updatedCustomer = customerService.changePassword(id, oldPassword, newPassword);
            updatedCustomer.setPassword(null);
            
            response.put("success", true);
            response.put("data", updatedCustomer);
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Delete customer
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCustomer(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            customerService.deleteCustomer(id);
            response.put("success", true);
            response.put("message", "Customer deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Get customers by status
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getCustomersByStatus(@PathVariable String status) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Customer> customers = customerService.getCustomersByStatus(status);
            customers.forEach(customer -> customer.setPassword(null));
            response.put("success", true);
            response.put("data", customers);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Suspend customer
    @PutMapping("/{id}/suspend")
    public ResponseEntity<Map<String, Object>> suspendCustomer(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Customer customer = customerService.suspendCustomer(id);
            customer.setPassword(null);
            response.put("success", true);
            response.put("data", customer);
            response.put("message", "Customer suspended successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Activate customer
    @PutMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activateCustomer(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Customer customer = customerService.activateCustomer(id);
            customer.setPassword(null);
            response.put("success", true);
            response.put("data", customer);
            response.put("message", "Customer activated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
