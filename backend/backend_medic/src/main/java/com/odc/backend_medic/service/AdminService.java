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
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;
    private final SpecialiteRepository specialiteRepository;
    private final RendezVousRepository rendezVousRepository;
    private final ConsultationRepository consultationRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final GeocodingService geocodingService;
    private final AuthService authService;

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
                // Comme pour un patient : le compte doit être confirmé par email
                // avant la première connexion, même s'il a été créé par un admin.
                .emailVerifie(false)
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

        // Envoie le mail de confirmation/activation, exactement comme pour une inscription patient.
        authService.sendVerificationEmail(savedUser);

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

    /**
     * Supprime définitivement un compte utilisateur (et, en cascade au niveau
     * base de données, sa fiche Patient/Médecin, ses disponibilités,
     * notifications et jetons associés).
     *
     * Deux garde-fous :
     *  - un admin ne peut pas se supprimer lui-même (évite de se retrouver
     *    sans accès admin par erreur) ;
     *  - impossible de supprimer le dernier compte administrateur restant.
     *
     * Si le compte a un historique de consultations médicales, la contrainte
     * SQL "ON DELETE RESTRICT" sur consultations.id_rdv bloque volontairement
     * la suppression physique (on ne fait jamais disparaître un dossier
     * médical) : on relaie alors un message clair invitant à désactiver le
     * compte plutôt qu'à le supprimer.
     */
    @Transactional
    public void deleteUser(Long idUtilisateur, Long currentAdminId) {
        User user = userRepository.findById(idUtilisateur)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        if (user.getIdUtilisateur().equals(currentAdminId)) {
            throw new IllegalStateException("Vous ne pouvez pas supprimer votre propre compte administrateur.");
        }

        if (user.getRole() == Role.ADMIN) {
            long totalAdmins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (totalAdmins <= 1) {
                throw new IllegalStateException("Impossible de supprimer le dernier compte administrateur.");
            }
        }

        try {
            userRepository.delete(user);
            userRepository.flush(); // force l'exécution SQL ici pour capturer une éventuelle violation de contrainte
        } catch (DataIntegrityViolationException e) {
            log.warn("Suppression refusée pour l'utilisateur {} : historique médical associé.", idUtilisateur);
            throw new IllegalStateException(
                    "Impossible de supprimer ce compte : il possède des rendez-vous avec des consultations médicales enregistrées. " +
                    "Désactivez plutôt le compte pour préserver l'historique médical.");
        }
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
