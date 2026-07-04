package com.odc.backend_medic.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.odc.backend_medic.dto.UserProfileUpdateRequest;
import com.odc.backend_medic.dto.UserResponse;
import com.odc.backend_medic.models.Medecin;
import com.odc.backend_medic.models.Patient;
import com.odc.backend_medic.models.User;
import com.odc.backend_medic.models.enumeration.Role;
import com.odc.backend_medic.repository.MedecinRepository;
import com.odc.backend_medic.repository.PatientRepository;
import com.odc.backend_medic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final PasswordEncoder passwordEncoder;
    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024; // 5 Mo

    public User getAuthenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + email));
    }

    /**
     * Construit la réponse de profil complète (jamais l'entité User brute :
     * ça exposerait le hash du mot de passe en JSON) en allant chercher
     * téléphone/adresse/antécédents sur la fiche Patient ou Médecin associée,
     * puisque ces champs ne vivent pas sur User.
     */
    public UserResponse getProfileResponse(String email) {
        User user = getAuthenticatedUser(email);
        return buildProfileResponse(user);
    }

    private UserResponse buildProfileResponse(User user) {
        if (user.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUser_IdUtilisateur(user.getIdUtilisateur()).orElse(null);
            if (patient != null) {
                return UserResponse.fromEntity(user, patient.getTelephone(), patient.getAdresse(), patient.getAntecedentsMedicaux());
            }
        } else if (user.getRole() == Role.MEDECIN) {
            Medecin medecin = medecinRepository.findByUser_IdUtilisateur(user.getIdUtilisateur()).orElse(null);
            if (medecin != null) {
                return UserResponse.fromEntity(user, medecin.getTelephone(), medecin.getAdresse(), null);
            }
        }
        return UserResponse.fromEntity(user);
    }

    /**
     * Met à jour les informations du compte (nom/prénom/email) ET les champs
     * spécifiques au profil métier (téléphone/adresse pour Patient et Médecin,
     * antécédents médicaux pour Patient).
     *
     * Avant ce correctif, seuls nom/prénom/email étaient persistés : téléphone,
     * adresse et antécédents médicaux saisis dans le formulaire "Paramètres"
     * étaient silencieusement perdus (jamais écrits en base). Et la réponse
     * renvoyait l'entité User brute, qui ne contient de toute façon pas ces
     * champs (ils vivent sur Patient/Medecin) — d'où "jamais récupérés" côté
     * frontend même après une sauvegarde réussie.
     */
    @Transactional
    public UserResponse updateProfile(String email, UserProfileUpdateRequest request) {
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

        return buildProfileResponse(savedUser);
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
     * Envoie la photo de profil sur Cloudinary (stockage cloud persistant) et
     * renvoie l'URL sécurisée (CDN) résultante.
     *
     * Avant : le fichier était écrit sur le disque local du serveur Render,
     * qui est éphémère — toute photo uploadée disparaissait au redéploiement
     * suivant, et l'URL renvoyée pointait vers app.base-url (souvent oublié,
     * donc http://localhost:8080 par défaut = inaccessible depuis le navigateur).
     *
     * On utilise un public_id déterministe par utilisateur ("user_<id>") avec
     * overwrite=true : chaque nouvel upload remplace automatiquement l'ancienne
     * image chez Cloudinary, sans avoir besoin de gérer nous-mêmes un nettoyage
     * de l'ancien fichier.
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

        String publicId = "medconnect/profile-images/user_" + user.getIdUtilisateur();

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "overwrite", true,
                "invalidate", true,
                "resource_type", "image",
                "folder", null // le public_id contient déjà le chemin complet
        ));

        String imageUrl = (String) uploadResult.get("secure_url");
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }

    public Optional<String> getProfileImageUrl(String email) {
        return userRepository.findByEmail(email).map(User::getProfileImageUrl);
    }
}
