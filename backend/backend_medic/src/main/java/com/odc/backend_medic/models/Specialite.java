package com.odc.backend_medic.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "specialites", indexes = {
        @Index(name = "idx_specialite_nom", columnList = "nom")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "idSpecialite")
public class Specialite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_specialite")
    private Long idSpecialite;

    @Column(name = "nom", nullable = false, unique = true, length = 100)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
