package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.BookRendezVousRequest;
import com.odc.backend_medic.dto.ConsultationResponse;
import com.odc.backend_medic.dto.DisponibiliteResponse;
import com.odc.backend_medic.dto.RendezVousResponse;
import com.odc.backend_medic.models.Disponibilite;
import com.odc.backend_medic.models.Patient;
import com.odc.backend_medic.models.RendezVous;
import com.odc.backend_medic.models.enumeration.StatutRendezVous;
import com.odc.backend_medic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final DisponibiliteRepository disponibiliteRepository;
    private final RendezVousRepository rendezVousRepository;
    private final ConsultationRepository consultationRepository;
    private final MedecinRepository medecinRepository;

    public Patient getAuthenticatedPatient(String email) {
        return patientRepository.findByUser_Email(email)
                .orElseThrow(() -> new UsernameNotFoundException("Patient introuvable : " + email));
    }

    public List<DisponibiliteResponse> getDisponibilitesDisponibles() {
        return disponibiliteRepository
                .findByEstLibreTrueAndDateDebutAfterOrderByDateDebutAsc(LocalDateTime.now())
                .stream()
                .map(DisponibiliteResponse::fromEntity)
                .toList();
    }

    @Transactional
    public Optional<RendezVousResponse> prendreRendezVous(Patient patient, BookRendezVousRequest request) {
        Disponibilite dispo = disponibiliteRepository.findById(request.getIdDispo())
                .orElseThrow(() -> new IllegalArgumentException("Créneau de disponibilité introuvable"));

        if (!dispo.isEstLibre()) {
            return Optional.empty(); // Le créneau vient d'être pris
        }

        // Marquer la disponibilité comme occupée
        dispo.setEstLibre(false);
        disponibiliteRepository.save(dispo);

        RendezVous rdv = RendezVous.builder()
                .dateHeure(dispo.getDateDebut())
                .duree(dispo.getDuree())
                .motif(request.getMotif())
                .statut(StatutRendezVous.ATTENTE)
                .patient(patient)
                .disponibilite(dispo)
                .build();

        return Optional.of(RendezVousResponse.fromEntity(rendezVousRepository.save(rdv)));
    }

    public List<RendezVousResponse> getMesRendezVous(Long idPatient) {
        return rendezVousRepository.findByPatient_IdPatient(idPatient).stream()
                .map(RendezVousResponse::fromEntity)
                .toList();
    }

    @Transactional
    public Optional<RendezVousResponse> annulerRendezVous(Patient patient, Long idRdv) {
        return rendezVousRepository.findById(idRdv)
                .filter(rdv -> rdv.getPatient().getIdPatient().equals(patient.getIdPatient()))
                .map(rdv -> {
                    rdv.setStatut(StatutRendezVous.ANNULE);
                    
                    // Libérer la disponibilité liée
                    Disponibilite dispo = rdv.getDisponibilite();
                    dispo.setEstLibre(true);
                    disponibiliteRepository.save(dispo);

                    return RendezVousResponse.fromEntity(rendezVousRepository.save(rdv));
                });
    }

    public List<ConsultationResponse> getMonHistorique(Long idPatient) {
        return consultationRepository.findByRendezVous_Patient_IdPatient(idPatient).stream()
                .map(ConsultationResponse::fromEntity)
                .toList();
    }

    public List<com.odc.backend_medic.dto.MedecinResponse> getAllMedecins() {
        return medecinRepository.findAll().stream()
                .map(com.odc.backend_medic.dto.MedecinResponse::fromEntity)
                .toList();
    }
}