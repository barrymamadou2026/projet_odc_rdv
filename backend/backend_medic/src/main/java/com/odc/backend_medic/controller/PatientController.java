package com.odc.backend_medic.controller;

import com.odc.backend_medic.dto.*;
import com.odc.backend_medic.models.Patient;
import com.odc.backend_medic.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/disponibilites")
    public List<DisponibiliteResponse> rechercherDisponibilites() {
        return patientService.getDisponibilitesDisponibles();
    }

    @PostMapping("/rendez-vous")
    public ResponseEntity<RendezVousResponse> prendreRendezVous(
            Authentication authentication, @Valid @RequestBody BookRendezVousRequest request) {
        Patient patient = patientService.getAuthenticatedPatient(authentication.getName());
        return patientService.prendreRendezVous(patient, request)
                .map(rdv -> ResponseEntity.status(HttpStatus.CREATED).body(rdv))
                .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }

    @GetMapping("/rendez-vous")
    public List<RendezVousResponse> mesRendezVous(Authentication authentication) {
        Patient patient = patientService.getAuthenticatedPatient(authentication.getName());
        return patientService.getMesRendezVous(patient.getIdPatient());
    }

    @PatchMapping("/rendez-vous/{id}/annuler")
    public ResponseEntity<RendezVousResponse> annuler(
            Authentication authentication,
            @PathVariable("id") Long idRdv,
            @RequestParam(value = "motif", required = false) String motif) {
        Patient patient = patientService.getAuthenticatedPatient(authentication.getName());
        return patientService.annulerRendezVous(patient, idRdv, motif)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/historique")
    public List<ConsultationResponse> monHistorique(Authentication authentication) {
        Patient patient = patientService.getAuthenticatedPatient(authentication.getName());
        return patientService.getMonHistorique(patient.getIdPatient());
    }

    @GetMapping("/consultations")
    public List<ConsultationResponse> mesConsultations(Authentication authentication) {
        Patient patient = patientService.getAuthenticatedPatient(authentication.getName());
        return patientService.getMonHistorique(patient.getIdPatient());
    }

    @GetMapping("/medecins")
    public List<com.odc.backend_medic.dto.MedecinResponse> tousLesMedecins() {
        return patientService.getAllMedecins();
    }

    /**
     * Médecins/hôpitaux les plus proches d'une position GPS (patient étranger ou
     * simplement non familier de la ville). lat/lng viennent de la géolocalisation
     * navigateur du patient ; rayonKm est optionnel (50 km par défaut).
     */
    @GetMapping("/medecins/proches")
    public ResponseEntity<List<com.odc.backend_medic.dto.MedecinResponse>> medecinsProches(
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam(value = "rayonKm", required = false, defaultValue = "50") double rayonKm) {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(patientService.getMedecinsProches(lat, lng, rayonKm));
    }
}
