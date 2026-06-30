package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.*;
import com.odc.backend_medic.models.*;
import com.odc.backend_medic.models.enumeration.StatutRendezVous;
import com.odc.backend_medic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final DisponibiliteRepository disponibiliteRepository;
    private final RendezVousRepository rendezVousRepository;
    private final ConsultationRepository consultationRepository;
    private final NotificationRepository notificationRepository;

    public Medecin getAuthenticatedMedecin(String email) {
        return medecinRepository.findByUser_Email(email)
                .orElseThrow(() -> new UsernameNotFoundException("Médecin introuvable : " + email));
    }

    @Transactional
    public DisponibiliteResponse declareDisponibilite(Medecin medecin, CreateDisponibiliteRequest request) {
        int duree = request.getDuree() > 0 ? request.getDuree() : 30; // Default to 30 mins if not provided
        LocalDateTime currentDebut = request.getDateDebut();
        LocalDateTime fin = request.getDateFin();
        Disponibilite lastDispo = null;

        while (currentDebut.plusMinutes(duree).isBefore(fin) || currentDebut.plusMinutes(duree).isEqual(fin)) {
            Disponibilite dispo = Disponibilite.builder()
                    .dateDebut(currentDebut)
                    .dateFin(currentDebut.plusMinutes(duree))
                    .duree(duree)
                    .estLibre(true)
                    .medecin(medecin)
                    .build();
            lastDispo = disponibiliteRepository.save(dispo);
            currentDebut = currentDebut.plusMinutes(duree);
        }
        
        if (lastDispo == null) {
             throw new IllegalArgumentException("La plage horaire est trop courte pour la durée spécifiée.");
        }
        return DisponibiliteResponse.fromEntity(lastDispo); // Return the last created one for simplicity, or modify to return a list
    }

    public List<DisponibiliteResponse> getMesDisponibilites(Long idMedecin) {
        return disponibiliteRepository.findByMedecin_IdMedecin(idMedecin).stream()
                .map(DisponibiliteResponse::fromEntity)
                .toList();
    }

    public List<RendezVousResponse> getMesRendezVous(Long idMedecin) {
        return rendezVousRepository.findByDisponibilite_Medecin_IdMedecin(idMedecin).stream()
                .map(RendezVousResponse::fromEntity)
                .toList();
    }

    @Transactional
    public Optional<RendezVousResponse> changerStatutRdv(Medecin medecin, Long idRdv, StatutRendezVous statut) {
        return rendezVousRepository.findById(idRdv)
                .filter(rdv -> rdv.getDisponibilite().getMedecin().getIdMedecin().equals(medecin.getIdMedecin()))
                .map(rdv -> {
                    rdv.setStatut(statut);
                    // Si annulé, on peut libérer à nouveau la disponibilité associée
                    if (statut == StatutRendezVous.ANNULE) {
                        rdv.getDisponibilite().setEstLibre(true);
                        disponibiliteRepository.save(rdv.getDisponibilite());
                    }
                    
                    RendezVous savedRdv = rendezVousRepository.save(rdv);
                    
                    // Création d'une notification pour le patient
                    String message = String.format("Votre rendez-vous du %s avec le Dr. %s est désormais %s.",
                            savedRdv.getDateHeure().toString(),
                            medecin.getUser().getNom(),
                            statut.name().toLowerCase());
                            
                    Notification notification = Notification.builder()
                            .message(message)
                            .user(savedRdv.getPatient().getUser())
                            .type(statut == StatutRendezVous.CONFIRME ? "INFO" : "ALERTE")
                            .dateEnvoi(LocalDateTime.now())
                            .estLu(false)
                            .build();
                    notificationRepository.save(notification);
                    
                    return RendezVousResponse.fromEntity(savedRdv);
                });
    }

    public List<ConsultationResponse> getMesConsultations(Long idMedecin) {
        return consultationRepository.findByRendezVous_Disponibilite_Medecin_IdMedecin(idMedecin).stream()
                .map(ConsultationResponse::fromEntity)
                .toList();
    }

    @Transactional
    public Optional<ConsultationResponse> redigerConsultation(Medecin medecin, Long idRdv, ConsultationRequest request) {
        RendezVous rdv = rendezVousRepository.findById(idRdv)
                .orElseThrow(() -> new IllegalArgumentException("Rendez-vous introuvable"));

        if (!rdv.getDisponibilite().getMedecin().getIdMedecin().equals(medecin.getIdMedecin())) {
            throw new AccessDeniedException("Ce rendez-vous ne vous appartient pas");
        }

        if (consultationRepository.findByRendezVous_IdRdv(idRdv).isPresent()) {
            return Optional.empty();
        }

        Consultation consultation = Consultation.builder()
                .dateConsultation(LocalDateTime.now())
                .diagnostic(request.getDiagnostic())
                .notesMedicales(request.getNotesMedicales())
                .ordonnance(request.getOrdonnance())
                .rendezVous(rdv)
                .build();

        // Le statut du rendez-vous reste inchangé (ex: CONFIRME) pour correspondre à ton énumération
        return Optional.of(ConsultationResponse.fromEntity(consultationRepository.save(consultation)));
    }
}