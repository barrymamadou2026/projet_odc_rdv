package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.ConsultationResponse;
import com.odc.backend_medic.dto.CreateMedecinRequest;
import com.odc.backend_medic.dto.NotificationResponse;
import com.odc.backend_medic.dto.RendezVousResponse;
import com.odc.backend_medic.dto.UserResponse;
import com.odc.backend_medic.models.Medecin;
import com.odc.backend_medic.models.Specialite;
import com.odc.backend_medic.models.User;
import com.odc.backend_medic.models.enumeration.Role;
import com.odc.backend_medic.repository.ConsultationRepository;
import com.odc.backend_medic.repository.MedecinRepository;
import com.odc.backend_medic.repository.NotificationRepository;
import com.odc.backend_medic.repository.RendezVousRepository;
import com.odc.backend_medic.repository.SpecialiteRepository;
import com.odc.backend_medic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;
    private final SpecialiteRepository specialiteRepository;
    private final RendezVousRepository rendezVousRepository;
    private final ConsultationRepository consultationRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final GeocodingService geocodingService;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Transactional
    public Optional<UserResponse> createMedecin(CreateMedecinRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return Optional.empty();
        }

        Specialite specialite = specialiteRepository.findById(request.getIdSpecialite())
                .orElseThrow(() -> new IllegalArgumentException("Spécialité introuvable"));

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.MEDECIN)
                .estActif(true)
                // Compte créé directement par l'admin (vérifié manuellement) :
                // pas besoin du parcours de double opt-in réservé aux patients.
                .emailVerifie(true)
                .build();

        User savedUser = userRepository.save(user);

        Double latitude = request.getLatitude();
        Double longitude = request.getLongitude();
        if ((latitude == null || longitude == null) && request.getAdresse() != null && !request.getAdresse().isBlank()) {
            latitude = null;
            longitude = null;
            var coords = geocodingService.geocoder(request.getAdresse());
            if (coords.isPresent()) {
                latitude = coords.get().latitude();
                longitude = coords.get().longitude();
            }
        }

        Medecin medecin = Medecin.builder()
                .user(savedUser)
                .specialite(specialite)
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .latitude(latitude)
                .longitude(longitude)
                .build();

        medecinRepository.save(medecin);

        return Optional.of(UserResponse.fromEntity(savedUser));
    }

    @Transactional
    public Optional<UserResponse> changeUserActivity(Long idUtilisateur, boolean actif) {
        return userRepository.findById(idUtilisateur)
                .map(user -> {
                    user.setEstActif(actif);
                    return UserResponse.fromEntity(userRepository.save(user));
                });
    }

    public List<RendezVousResponse> getAllRendezVous() {
        return rendezVousRepository.findAll().stream()
                .map(RendezVousResponse::fromEntity)
                .toList();
    }

    public List<Specialite> getAllSpecialites() {
        return specialiteRepository.findAll();
    }

    /**
     * Supervision totale : visibilité admin à 360° sur l'ensemble
     * des fiches de consultation de la structure (diagnostics, ordonnances).
     */
    public List<ConsultationResponse> getAllConsultations() {
        return consultationRepository.findAll().stream()
                .map(ConsultationResponse::fromEntity)
                .toList();
    }

    /**
     * Supervision totale : visibilité admin sur l'ensemble du flux
     * de notifications envoyées à tous les utilisateurs de la plateforme.
     */
    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAll(Sort.by(Sort.Direction.DESC, "dateEnvoi")).stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }
}
