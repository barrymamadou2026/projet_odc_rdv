package com.odc.backend_medic.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultations", indexes = {
        @Index(name = "idx_consultation_rdv", columnList = "id_rdv")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "idConsultation")
@ToString(exclude = "rendezVous")
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consultation")
    private Long idConsultation;

    @Column(name = "date_consultation", nullable = false)
    private LocalDateTime dateConsultation;

    @Column(name = "diagnostic", columnDefinition = "TEXT")
    private String diagnostic;

    @Column(name = "notes_medicales", columnDefinition = "TEXT")
    private String notesMedicales;

    @Column(name = "ordonnance", columnDefinition = "TEXT")
    private String ordonnance; // Ajout ordonnance

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_rdv", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_consultation_rdv"))
    private RendezVous rendezVous;
}