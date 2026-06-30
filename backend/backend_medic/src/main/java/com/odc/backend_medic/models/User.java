package com.odc.backend_medic.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.odc.backend_medic.models.enumeration.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "utilisateurs", indexes = {
        @Index(name = "idx_utilisateur_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "idUtilisateur")
@ToString(exclude = {"notifications"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur")
    private Long idUtilisateur;

    @Column(name = "nom", nullable = false, length = 50)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 50)
    private String prenom;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String password;

    // Mapping direct sur la nouvelle colonne 'role' (VARCHAR)
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Builder.Default
    @Column(name = "est_actif", nullable = false)
    private boolean estActif = true;

    @Builder.Default
    @Column(name = "date_inscription", nullable = false, updatable = false)
    private LocalDateTime dateInscription = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    @Column(name = "profile_image_url", length = 255)
    private String profileImageUrl;
}