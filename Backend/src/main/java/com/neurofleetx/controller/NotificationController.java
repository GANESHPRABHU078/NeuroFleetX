package com.neurofleetx.controller;

import com.neurofleetx.entity.NotificationPreference;
import com.neurofleetx.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    // Get notification preferences for a user
    @GetMapping("/preferences/{userId}")
    public ResponseEntity<Map<String, Object>> getPreferences(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<NotificationPreference> preferences = notificationService.getPreferences(userId);
        
        if (preferences.isPresent()) {
            response.put("success", true);
            response.put("data", preferences.get());
            return ResponseEntity.ok(response);
        } else {
            // Return default preferences if none exist
            NotificationPreference defaultPref = new NotificationPreference(userId, true, false, true);
            response.put("success", true);
            response.put("data", defaultPref);
            return ResponseEntity.ok(response);
        }
    }
    
    // Save or update notification preferences
    @PostMapping("/preferences")
    public ResponseEntity<Map<String, Object>> savePreferences(@RequestBody NotificationPreference preference) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            NotificationPreference saved = notificationService.savePreferences(preference);
            
            response.put("success", true);
            response.put("message", "Notification preferences saved successfully");
            response.put("data", saved);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Test endpoint to send a test notification
    @PostMapping("/test/{userId}")
    public ResponseEntity<Map<String, Object>> sendTestNotification(
            @PathVariable String userId,
            @RequestBody Map<String, String> notificationData) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String type = notificationData.get("type"); // "email", "sms", or "push"
            String message = notificationData.getOrDefault("message", "Test notification from NeuroFleetX");
            
            switch (type) {
                case "email":
                    notificationService.sendEmailNotification(userId, "Test Notification", message);
                    response.put("message", "Test email sent");
                    break;
                case "sms":
                    notificationService.sendSMSNotification(userId, message);
                    response.put("message", "Test SMS sent");
                    break;
                case "push":
                    notificationService.sendPushNotification(userId, "Test Notification", message);
                    response.put("message", "Test push notification sent");
                    break;
                default:
                    notificationService.sendAllNotifications(userId, "Test Notification", message);
                    response.put("message", "All test notifications sent");
            }
            
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
