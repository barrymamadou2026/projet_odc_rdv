package com.odc.backend_medic.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Jeton à usage unique prouvant que l'utilisateur a bien accès à la boîte mail
 * fournie lors de l'inscription (double opt-in).
 */
@Entity
@Table(name = "email_verification_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "id_utilisateur")
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;
}
