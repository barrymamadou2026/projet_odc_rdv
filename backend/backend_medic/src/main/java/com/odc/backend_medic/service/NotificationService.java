package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.NotificationResponse;
import com.odc.backend_medic.models.User;
import com.odc.backend_medic.repository.NotificationRepository;
import com.odc.backend_medic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationResponse> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + email));
        return notificationRepository.findByUserOrderByDateEnvoiDesc(user).stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Transactional
    public Optional<NotificationResponse> markNotificationAsRead(String email, Long notificationId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + email));

        return notificationRepository.findById(notificationId)
                .filter(notification -> notification.getUser().equals(user))
                .map(notification -> {
                    notification.setEstLu(true);
                    return NotificationResponse.fromEntity(notificationRepository.save(notification));
                });
    }

    @Transactional
    public void markAllNotificationsAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + email));
        notificationRepository.findByUserOrderByDateEnvoiDesc(user).forEach(notification -> {
            notification.setEstLu(true);
            notificationRepository.save(notification);
        });
    }
}
