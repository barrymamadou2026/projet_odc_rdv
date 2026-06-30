package com.odc.backend_medic.controller;

import com.odc.backend_medic.dto.NotificationResponse;
import com.odc.backend_medic.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> getNotifications(Authentication authentication) {
        return notificationService.getUserNotifications(authentication.getName());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(Authentication authentication, @PathVariable Long id) {
        return notificationService.markNotificationAsRead(authentication.getName(), id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllNotificationsAsRead(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
