package com.odc.backend_medic.dto;

import com.odc.backend_medic.models.RendezVous;
import com.odc.backend_medic.models.enumeration.StatutRendezVous;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousResponse {

    private Long idRdv;
    private LocalDateTime dateHeure;
    private int duree;
    private StatutRendezVous statut;
    private String motif;
    private Long idPatient;
    private String nomPatient;
    private String prenomPatient;
    private Long idMedecin;
    private String nomMedecin;
    private String prenomMedecin;
    private String patientNom;
    private String medecinNom;

    public static RendezVousResponse fromEntity(RendezVous r) {
        return RendezVousResponse.builder()
                .idRdv(r.getIdRdv())
                .dateHeure(r.getDateHeure())
                .duree(r.getDuree())
                .statut(r.getStatut())
                .motif(r.getMotif())
                .idPatient(r.getPatient().getIdPatient())
                .nomPatient(r.getPatient().getUser().getNom())
                .prenomPatient(r.getPatient().getUser().getPrenom())
                .idMedecin(r.getDisponibilite().getMedecin().getIdMedecin())
                .nomMedecin(r.getDisponibilite().getMedecin().getUser().getNom())
                .prenomMedecin(r.getDisponibilite().getMedecin().getUser().getPrenom())
                .patientNom(r.getPatient().getUser().getPrenom() + " " + r.getPatient().getUser().getNom())
                .medecinNom(r.getDisponibilite().getMedecin().getUser().getPrenom() + " " + r.getDisponibilite().getMedecin().getUser().getNom())
                .build();
    }
}