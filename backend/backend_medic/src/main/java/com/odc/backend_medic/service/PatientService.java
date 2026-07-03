package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.BookRendezVousRequest;
import com.odc.backend_medic.dto.ConsultationResponse;
import com.odc.backend_medic.dto.DisponibiliteResponse;
import com.odc.backend_medic.dto.RendezVousResponse;
import com.odc.backend_medic.models.Disponibilite;
import com.odc.backend_medic.models.Medecin;
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
    private final AppointmentNotifier appointmentNotifier;

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

        RendezVous savedRdv = rendezVousRepository.save(rdv);

        // Le médecin est notifié en temps réel d'une nouvelle demande de rendez-vous.
        Medecin medecin = dispo.getMedecin();
        String message = String.format("Nouvelle demande de rendez-vous le %s de la part de %s %s.",
                AppointmentNotifier.formatDate(savedRdv.getDateHeure()),
                patient.getUser().getPrenom(), patient.getUser().getNom());
        appointmentNotifier.notifier(medecin.getUser(), message, "Nouvelle demande de rendez-vous",
                "INFO", medecin.getTelephone());

        return Optional.of(RendezVousResponse.fromEntity(savedRdv));
    }

    public List<RendezVousResponse> getMesRendezVous(Long idPatient) {
        return rendezVousRepository.findByPatient_IdPatient(idPatient).stream()
                .map(RendezVousResponse::fromEntity)
                .toList();
    }

    /**
     * Le patient peut annuler son rendez-vous à tout moment, tant qu'il n'est
     * pas déjà annulé. Le médecin concerné est notifié immédiatement
     * (in-app + email + SMS).
     */
    @Transactional
    public Optional<RendezVousResponse> annulerRendezVous(Patient patient, Long idRdv, String motif) {
        return rendezVousRepository.findById(idRdv)
                .filter(rdv -> rdv.getPatient().getIdPatient().equals(patient.getIdPatient()))
                .filter(rdv -> rdv.getStatut() != StatutRendezVous.ANNULE)
                .map(rdv -> {
                    rdv.setStatut(StatutRendezVous.ANNULE);
                    rdv.setAnnulePar("PATIENT");
                    rdv.setMotifAnnulation(motif);
                    rdv.setDateAnnulation(LocalDateTime.now());

                    // Libérer la disponibilité liée
                    Disponibilite dispo = rdv.getDisponibilite();
                    dispo.setEstLibre(true);
                    disponibiliteRepository.save(dispo);

                    RendezVous savedRdv = rendezVousRepository.save(rdv);

                    Medecin medecin = dispo.getMedecin();
                    String message = String.format(
                            "%s %s a annulé son rendez-vous du %s.%s",
                            patient.getUser().getPrenom(), patient.getUser().getNom(),
                            AppointmentNotifier.formatDate(savedRdv.getDateHeure()),
                            (motif != null && !motif.isBlank()) ? " Motif : " + motif : "");
                    appointmentNotifier.notifier(medecin.getUser(), message, "Rendez-vous annulé par le patient",
                            "ALERTE", medecin.getTelephone());

                    return RendezVousResponse.fromEntity(savedRdv);
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

    /**
     * Médecins/hôpitaux les plus proches d'une position GPS donnée (utile pour
     * les patients étrangers ou de passage qui ne connaissent pas les structures
     * locales). Ne renvoie que les médecins dont l'adresse a pu être géolocalisée,
     * triés du plus proche au plus loin, dans un rayon donné (par défaut 50 km).
     */
    public List<com.odc.backend_medic.dto.MedecinResponse> getMedecinsProches(double lat, double lng, double rayonKm) {
        return medecinRepository.findAll().stream()
                .filter(m -> m.getLatitude() != null && m.getLongitude() != null)
                .map(m -> {
                    double distance = GeocodingService.distanceKm(lat, lng, m.getLatitude(), m.getLongitude());
                    com.odc.backend_medic.dto.MedecinResponse dto = com.odc.backend_medic.dto.MedecinResponse.fromEntity(m);
                    dto.setDistanceKm(Math.round(distance * 10.0) / 10.0);
                    return dto;
                })
                .filter(dto -> dto.getDistanceKm() <= rayonKm)
                .sorted(java.util.Comparator.comparingDouble(com.odc.backend_medic.dto.MedecinResponse::getDistanceKm))
                .toList();
    }
}
