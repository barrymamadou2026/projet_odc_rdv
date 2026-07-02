package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.UserProfileUpdateRequest;
import com.odc.backend_medic.models.Medecin;
import com.odc.backend_medic.models.Patient;
import com.odc.backend_medic.models.User;
import com.odc.backend_medic.models.enumeration.Role;
import com.odc.backend_medic.repository.MedecinRepository;
import com.odc.backend_medic.repository.PatientRepository;
import com.odc.backend_medic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final PasswordEncoder passwordEncoder;

    // Répertoire physique où les fichiers sont stockés sur le serveur.
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // URL publique de base du backend, utilisée pour reconstruire une URL absolue accessible par le navigateur.
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024; // 5 Mo

    public User getAuthenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + email));
    }

    /**
     * Met à jour les informations du compte (nom/prénom/email) ET les champs
     * spécifiques au profil métier (téléphone/adresse pour Patient et Médecin,
     * antécédents médicaux pour Patient).
     *
     * Avant ce correctif, seuls nom/prénom/email étaient persistés : téléphone,
     * adresse et antécédents médicaux saisis dans le formulaire "Paramètres"
     * étaient silencieusement perdus (jamais écrits en base).
     */
    @Transactional
    public User updateProfile(String email, UserProfileUpdateRequest request) {
        User user = getAuthenticatedUser(email);

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail()); // Consider re-authentication or verification if email changes
        User savedUser = userRepository.save(user);

        if (user.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUser_IdUtilisateur(user.getIdUtilisateur())
                    .orElseThrow(() -> new IllegalStateException("Fiche patient introuvable pour cet utilisateur."));
            patient.setTelephone(request.getTelephone());
            patient.setAdresse(request.getAdresse());
            if (request.getAntecedentsMedicaux() != null) {
                patient.setAntecedentsMedicaux(request.getAntecedentsMedicaux());
            }
            patientRepository.save(patient);
        } else if (user.getRole() == Role.MEDECIN) {
            Medecin medecin = medecinRepository.findByUser_IdUtilisateur(user.getIdUtilisateur())
                    .orElseThrow(() -> new IllegalStateException("Fiche médecin introuvable pour cet utilisateur."));
            medecin.setTelephone(request.getTelephone());
            medecin.setAdresse(request.getAdresse());
            medecinRepository.save(medecin);
        }

        return savedUser;
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = getAuthenticatedUser(email);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Ancien mot de passe incorrect.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Enregistre physiquement le fichier envoyé par l'utilisateur sur le disque du serveur
     * et renvoie une URL absolue et réellement accessible par le navigateur.
     *
     * Avant : une URL factice ("https://example.com/...") était générée sans jamais
     * sauvegarder le fichier, ce qui provoquait un blocage ORB (OpaqueResponseBlocking)
     * côté navigateur car cette URL ne renvoyait pas une vraie image.
     */
    @Transactional
    public String uploadProfileImage(String email, MultipartFile file) throws IOException {
        User user = getAuthenticatedUser(email);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier fourni.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Le fichier dépasse la taille maximale autorisée (5 Mo).");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Format d'image non supporté. Utilisez JPEG, PNG, WEBP ou GIF.");
        }

        // Répertoire dédié aux photos de profil.
        Path targetDir = Paths.get(uploadDir, "profile-images");
        Files.createDirectories(targetDir);

        // Nom de fichier unique pour éviter les collisions et les problèmes de cache.
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }
        String storedFilename = "user_" + user.getIdUtilisateur() + "_" + UUID.randomUUID() + extension;

        Path targetPath = targetDir.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Nettoyage de l'ancienne image (évite d'accumuler des fichiers orphelins).
        deleteOldProfileImage(user.getProfileImageUrl());

        String imageUrl = baseUrl + "/uploads/profile-images/" + storedFilename;
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }

    private void deleteOldProfileImage(String oldImageUrl) {
        if (oldImageUrl == null || !oldImageUrl.contains("/uploads/profile-images/")) {
            return;
        }
        try {
            String oldFilename = oldImageUrl.substring(oldImageUrl.lastIndexOf('/') + 1);
            Path oldPath = Paths.get(uploadDir, "profile-images", oldFilename);
            Files.deleteIfExists(oldPath);
        } catch (IOException ignored) {
            // Suppression best-effort : une erreur ici ne doit jamais bloquer l'upload de la nouvelle image.
        }
    }

    public Optional<String> getProfileImageUrl(String email) {
        return userRepository.findByEmail(email).map(User::getProfileImageUrl);
    }
}
