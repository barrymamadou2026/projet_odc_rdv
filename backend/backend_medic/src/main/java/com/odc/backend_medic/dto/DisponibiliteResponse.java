package com.odc.backend_medic.dto;

import com.odc.backend_medic.models.Disponibilite;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisponibiliteResponse {

    private Long idDispo;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private int duree;
    private boolean estLibre;
    private Long idMedecin;
    private String nomMedecin;
    private String prenomMedecin;
    private String specialite;

    public static DisponibiliteResponse fromEntity(Disponibilite d) {
        return DisponibiliteResponse.builder()
                .idDispo(d.getIdDispo())
                .dateDebut(d.getDateDebut())
                .dateFin(d.getDateFin())
                .duree(d.getDuree())
                .estLibre(d.isEstLibre())
                .idMedecin(d.getMedecin().getIdMedecin())
                .nomMedecin(d.getMedecin().getUser().getNom())
                .prenomMedecin(d.getMedecin().getUser().getPrenom())
                .specialite(d.getMedecin().getSpecialite() != null ? d.getMedecin().getSpecialite().getNom() : null)
                .build();
    }
}