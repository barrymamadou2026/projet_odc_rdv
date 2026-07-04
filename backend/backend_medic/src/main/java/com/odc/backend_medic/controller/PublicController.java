package com.odc.backend_medic.controller;

import com.odc.backend_medic.dto.PublicStatsResponse;
import com.odc.backend_medic.repository.ConsultationRepository;
import com.odc.backend_medic.repository.MedecinRepository;
import com.odc.backend_medic.repository.PatientRepository;
import com.odc.backend_medic.repository.SpecialiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints publics, accessibles sans authentification (voir SecurityConfig
 * "/api/public/**" -> permitAll). Utilisé par la page d'accueil pour afficher
 * de vraies statistiques plutôt que des chiffres marketing codés en dur.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final ConsultationRepository consultationRepository;
    private final SpecialiteRepository specialiteRepository;

    @GetMapping("/stats")
    public PublicStatsResponse getStats() {
        return PublicStatsResponse.builder()
                .totalPatients(patientRepository.count())
                .totalMedecins(medecinRepository.count())
                .totalConsultations(consultationRepository.count())
                .totalSpecialites(specialiteRepository.count())
                .build();
    }
}
