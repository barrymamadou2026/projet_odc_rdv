package com.odc.backend_medic.controller;

import com.odc.backend_medic.dto.*;
import com.odc.backend_medic.models.Medecin;
import com.odc.backend_medic.models.enumeration.StatutRendezVous;
import com.odc.backend_medic.service.MedecinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecin")
@RequiredArgsConstructor
public class MedecinController {

    private final MedecinService medecinService;

    @PostMapping("/disponibilites")
    public ResponseEntity<DisponibiliteResponse> declarerDisponibilite(
            Authentication authentication, @Valid @RequestBody CreateDisponibiliteRequest request) {
        Medecin medecin = medecinService.getAuthenticatedMedecin(authentication.getName());
        DisponibiliteResponse response = medecinService.declareDisponibilite(medecin, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/disponibilites")
    public List<DisponibiliteResponse> mesDisponibilites(Authentication authentication) {
        Medecin medecin = medecinService.getAuthenticatedMedecin(authentication.getName());
        return medecinService.getMesDisponibilites(medecin.getIdMedecin());
    }

    @GetMapping("/rendez-vous")
    public List<RendezVousResponse> mesRendezVous(Authentication authentication) {
        Medecin medecin = medecinService.getAuthenticatedMedecin(authentication.getName());
        return medecinService.getMesRendezVous(medecin.getIdMedecin());
    }

    @PatchMapping("/rendez-vous/{id}/confirmer")
    public ResponseEntity<RendezVousResponse> confirmer(Authentication authentication, @PathVariable("id") Long idRdv) {
        Medecin medecin = medecinService.getAuthenticatedMedecin(authentication.getName());
        return ResponseEntity.ok(medecinService.changerStatutRdv(medecin, idRdv, StatutRendezVous.CONFIRME, null));
    }

    /** Le médecin peut annuler un rendez-vous à tout moment, comme le patient. */
    @PatchMapping("/rendez-vous/{id}/annuler")
    public ResponseEntity<RendezVousResponse> annuler(
            Authentication authentication,
            @PathVariable("id") Long idRdv,
            @RequestParam(value = "motif", required = false) String motif) {
        Medecin medecin = medecinService.getAuthenticatedMedecin(authentication.getName());
        return ResponseEntity.ok(medecinService.changerStatutRdv(medecin, idRdv, StatutRendezVous.ANNULE, motif));
    }

    @PostMapping("/rendez-vous/{id}/consultation")
    public ResponseEntity<ConsultationResponse> rediger(
            Authentication authentication, @PathVariable("id") Long idRdv,
            @Valid @RequestBody ConsultationRequest request) {

        Medecin medecin = medecinService.getAuthenticatedMedecin(authentication.getName());
        
        return medecinService.redigerConsultation(medecin, idRdv, request)
                .map(consultation -> ResponseEntity.status(HttpStatus.CREATED).body(consultation))
                .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }
}
