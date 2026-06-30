package com.odc.backend_medic.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_utilisateur", columnList = "id_utilisateur"),
        @Index(name = "idx_notification_date", columnList = "date_envoi")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "idNotification")
@ToString(exclude = "user")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notification")
    private Long idNotification;

    @Column(name = "message", nullable = false, length = 255)
    private String message;

    @Builder.Default
    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    @Builder.Default
    @Column(name = "est_lu", nullable = false)
    private boolean estLu = false;

    @Builder.Default // <-- Ajoute cette annotation ici pour faire disparaître le warning !
    @Column(name = "type", length = 20)
    private String type = "INFO"; // Correspond à l'enum SQL ('INFO', 'ALERTE', 'RAPPEL')

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur", nullable = false, foreignKey = @ForeignKey(name = "fk_notification_utilisateur"))
    private User user;
}