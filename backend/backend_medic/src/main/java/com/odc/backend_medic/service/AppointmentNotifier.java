package com.odc.backend_medic.service;

import com.odc.backend_medic.models.Notification;
import com.odc.backend_medic.models.User;
import com.odc.backend_medic.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Point central pour notifier un utilisateur d'un évènement de rendez-vous
 * (création, confirmation, annulation) : crée la notification in-app ET
 * déclenche l'envoi réel d'un email + SMS.
 */
@Service
@RequiredArgsConstructor
public class AppointmentNotifier {

    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy 'à' HH:mm");

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    /**
     * @param destinataire l'utilisateur (patient ou médecin) à notifier
     * @param message le texte de la notification / du SMS
     * @param subject le sujet de l'email
     * @param type "INFO", "ALERTE" ou "RAPPEL" (correspond à l'enum SQL)
     * @param telephone numéro de téléphone du destinataire (peut être null)
     */
    public void notifier(User destinataire, String message, String subject, String type, String telephone) {
        Notification notification = Notification.builder()
                .message(message)
                .user(destinataire)
                .type(type)
                .dateEnvoi(LocalDateTime.now())
                .estLu(false)
                .build();
        notificationRepository.save(notification);

        emailService.sendAppointmentNotification(destinataire.getEmail(), subject, message);

        if (telephone != null && !telephone.isBlank()) {
            smsService.sendSms(telephone, message);
        }
    }

    public static String formatDate(LocalDateTime dateHeure) {
        return dateHeure.format(FORMAT);
    }
}
