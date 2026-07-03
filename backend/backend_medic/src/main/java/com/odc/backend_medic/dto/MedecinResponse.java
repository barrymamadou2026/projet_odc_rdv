package com.odc.backend_medic.dto;

import com.odc.backend_medic.models.Medecin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedecinResponse {
    private Long idMedecin;
    private Long idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private String specialite;
    private String telephone;
    private String adresse;
    private Double latitude;
    private Double longitude;

    /** Renseigné uniquement par l'endpoint "médecins à proximité". */
    private Double distanceKm;

    public static MedecinResponse fromEntity(Medecin m) {
        return MedecinResponse.builder()
                .idMedecin(m.getIdMedecin())
                .idUtilisateur(m.getUser().getIdUtilisateur())
                .nom(m.getUser().getNom())
                .prenom(m.getUser().getPrenom())
                .email(m.getUser().getEmail())
                .specialite(m.getSpecialite() != null ? m.getSpecialite().getNom() : null)
                .telephone(m.getTelephone())
                .adresse(m.getAdresse())
                .latitude(m.getLatitude())
                .longitude(m.getLongitude())
                .build();
    }
}
