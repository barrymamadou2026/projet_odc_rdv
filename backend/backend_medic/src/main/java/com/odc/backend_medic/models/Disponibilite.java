package com.odc.backend_medic.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "disponibilites", indexes = {
        @Index(name = "idx_dispo_medecin", columnList = "id_medecin"),
        @Index(name = "idx_dispo_date_debut", columnList = "date_debut")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "idDispo")
@ToString(exclude = "medecin")
public class Disponibilite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dispo")
    private Long idDispo;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDateTime dateFin;

    @Column(name = "duree", nullable = false)
    private int duree; // Durée en minutes requis par le nouveau script

    @Builder.Default
    @Column(name = "est_libre", nullable = false)
    private boolean estLibre = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_medecin", nullable = false, foreignKey = @ForeignKey(name = "fk_dispo_medecin"))
    private Medecin medecin; // Lie vers Medecin.java
}