package com.odc.backend_medic.dto;

import com.odc.backend_medic.models.Consultation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponse {

    private Long idConsultation;
    private LocalDateTime dateConsultation;
    private String diagnostic;
    private String notesMedicales;
    private String ordonnance;
    private Long idRdv;

    // Identité du médecin (nécessaire à l'affichage côté Patient)
    private String nomMedecin;
    private String prenomMedecin;
    private String specialiteMedecin;

    // Identité du patient (nécessaire à l'affichage côté Médecin / Admin)
    private String nomPatient;
    private String prenomPatient;

    public static ConsultationResponse fromEntity(Consultation c) {
        var rdv = c.getRendezVous();
        var medecin = rdv != null && rdv.getDisponibilite() != null ? rdv.getDisponibilite().getMedecin() : null;
        var patient = rdv != null ? rdv.getPatient() : null;

        return ConsultationResponse.builder()
                .idConsultation(c.getIdConsultation())
                .dateConsultation(c.getDateConsultation())
                .diagnostic(c.getDiagnostic())
                .notesMedicales(c.getNotesMedicales())
                .ordonnance(c.getOrdonnance())
                .idRdv(rdv != null ? rdv.getIdRdv() : null)
                .nomMedecin(medecin != null && medecin.getUser() != null ? medecin.getUser().getNom() : null)
                .prenomMedecin(medecin != null && medecin.getUser() != null ? medecin.getUser().getPrenom() : null)
                .specialiteMedecin(medecin != null && medecin.getSpecialite() != null ? medecin.getSpecialite().getNom() : null)
                .nomPatient(patient != null && patient.getUser() != null ? patient.getUser().getNom() : null)
                .prenomPatient(patient != null && patient.getUser() != null ? patient.getUser().getPrenom() : null)
                .build();
    }
}
