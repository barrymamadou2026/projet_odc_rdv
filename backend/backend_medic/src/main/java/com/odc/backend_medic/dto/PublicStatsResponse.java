package com.odc.backend_medic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Chiffres réels affichés sur la page d'accueil publique (avant, ces
 * nombres étaient codés en dur dans le frontend : "5000+ patients",
 * "4.9/5", "12k+ consultations" — aucun lien avec la vraie base).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicStatsResponse {
    private long totalPatients;
    private long totalMedecins;
    private long totalConsultations;
    private long totalSpecialites;
}
