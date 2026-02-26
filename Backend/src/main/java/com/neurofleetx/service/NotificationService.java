package com.neurofleetx.service;

import com.neurofleetx.entity.NotificationPreference;
import com.neurofleetx.repository.NotificationPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationPreferenceRepository notificationPreferenceRepository;
    
    // Get user's notification preferences
    public Optional<NotificationPreference> getPreferences(String userId) {
        return notificationPreferenceRepository.findByUserId(userId);
    }
    
    // Save or update notification preferences
    public NotificationPreference savePreferences(NotificationPreference preference) {
        Optional<NotificationPreference> existing = notificationPreferenceRepository.findByUserId(preference.getUserId());
        
        if (existing.isPresent()) {
            NotificationPreference existingPref = existing.get();
            existingPref.setEmailAlerts(preference.isEmailAlerts());
            existingPref.setSmsNotifications(preference.isSmsNotifications());
            existingPref.setPushNotifications(preference.isPushNotifications());
            
            if (preference.getEmailAddress() != null) {
                existingPref.setEmailAddress(preference.getEmailAddress());
            }
            if (preference.getPhoneNumber() != null) {
                existingPref.setPhoneNumber(preference.getPhoneNumber());
            }
            if (preference.getDeviceToken() != null) {
                existingPref.setDeviceToken(preference.getDeviceToken());
            }
            
            return notificationPreferenceRepository.save(existingPref);
        } else {
            return notificationPreferenceRepository.save(preference);
        }
    }
    
    // Send email notification
    public void sendEmailNotification(String userId, String subject, String message) {
        Optional<NotificationPreference> pref = getPreferences(userId);
        
        if (pref.isPresent() && pref.get().isEmailAlerts()) {
            String email = pref.get().getEmailAddress();
            if (email != null && !email.isEmpty()) {
                // Integrate with email service (SendGrid, AWS SES, SMTP)
                System.out.println("📧 Email sent to: " + email);
                System.out.println("Subject: " + subject);
                System.out.println("Message: " + message);
                // Example: emailService.send(email, subject, message);
            }
        }
    }
    
    // Send SMS notification
    public void sendSMSNotification(String userId, String message) {
        Optional<NotificationPreference> pref = getPreferences(userId);
        
        if (pref.isPresent() && pref.get().isSmsNotifications()) {
            String phone = pref.get().getPhoneNumber();
            if (phone != null && !phone.isEmpty()) {
                // Integrate with SMS service (Twilio, AWS SNS)
                System.out.println("📱 SMS sent to: " + phone);
                System.out.println("Message: " + message);
                // Example: twilioService.send(phone, message);
            }
        }
    }
    
    // Send push notification
    public void sendPushNotification(String userId, String title, String body) {
        Optional<NotificationPreference> pref = getPreferences(userId);
        
        if (pref.isPresent() && pref.get().isPushNotifications()) {
            String deviceToken = pref.get().getDeviceToken();
            if (deviceToken != null && !deviceToken.isEmpty()) {
                // Integrate with push service (Firebase Cloud Messaging)
                System.out.println("🔔 Push notification sent to device: " + deviceToken);
                System.out.println("Title: " + title);
                System.out.println("Body: " + body);
                // Example: fcmService.send(deviceToken, title, body);
            }
        }
    }
    
    // Send all enabled notifications
    public void sendAllNotifications(String userId, String subject, String message) {
        sendEmailNotification(userId, subject, message);
        sendSMSNotification(userId, message);
        sendPushNotification(userId, subject, message);
    }
}
