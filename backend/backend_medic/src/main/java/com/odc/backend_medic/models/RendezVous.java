package com.odc.backend_medic.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.odc.backend_medic.models.enumeration.StatutRendezVous;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rendez_vous", indexes = {
        @Index(name = "idx_rdv_patient", columnList = "id_patient"),
        @Index(name = "idx_rdv_dispo", columnList = "id_dispo"),
        @Index(name = "idx_rdv_date_heure", columnList = "date_heure")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "idRdv")
@ToString(exclude = {"patient", "disponibilite", "consultation"})
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rdv")
    private Long idRdv;

    @Column(name = "date_heure", nullable = false)
    private LocalDateTime dateHeure;

    @Column(name = "duree", nullable = false)
    private int duree;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutRendezVous statut = StatutRendezVous.ATTENTE;

    @Column(name = "motif", columnDefinition = "TEXT")
    private String motif;

    /** Qui a déclenché l'annulation : "PATIENT" ou "MEDECIN". Null tant que non annulé. */
    @Column(name = "annule_par", length = 20)
    private String annulePar;

    /** Raison optionnelle fournie lors de l'annulation. */
    @Column(name = "motif_annulation", columnDefinition = "TEXT")
    private String motifAnnulation;

    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_patient", nullable = false, foreignKey = @ForeignKey(name = "fk_rdv_patient"))
    private Patient patient; // Point vers Patient

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_dispo", nullable = false, foreignKey = @ForeignKey(name = "fk_rdv_dispo"))
    private Disponibilite disponibilite; // Remplacement de l'id_medecin direct par le lien de dispo du script

    @JsonIgnore
    @OneToOne(mappedBy = "rendezVous", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Consultation consultation;
}
