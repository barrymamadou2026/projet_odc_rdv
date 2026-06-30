package com.odc.backend_medic.dto;

import com.odc.backend_medic.models.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private Long idPatient;
    private Long idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private String antecedentsMedicaux;

    public static PatientResponse fromEntity(Patient p) {
        return PatientResponse.builder()
                .idPatient(p.getIdPatient())
                .idUtilisateur(p.getUser().getIdUtilisateur())
                .nom(p.getUser().getNom())
                .prenom(p.getUser().getPrenom())
                .email(p.getUser().getEmail())
                .telephone(p.getTelephone())
                .adresse(p.getAdresse())
                .antecedentsMedicaux(p.getAntecedentsMedicaux())
                .build();
    }
}