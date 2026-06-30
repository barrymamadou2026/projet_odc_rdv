package com.odc.backend_medic.dto;

import com.odc.backend_medic.models.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String message;
    private LocalDateTime dateEnvoi;
    private boolean estLu;
    private String type;

    public static NotificationResponse fromEntity(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getIdNotification())
                .message(notification.getMessage())
                .dateEnvoi(notification.getDateEnvoi())
                .estLu(notification.isEstLu())
                .type(notification.getType())
                .build();
    }
}
