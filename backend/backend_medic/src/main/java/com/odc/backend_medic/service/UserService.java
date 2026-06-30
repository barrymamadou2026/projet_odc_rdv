package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.UserProfileUpdateRequest;
import com.odc.backend_medic.models.User;
import com.odc.backend_medic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // private final S3Service s3Service; // Uncomment if S3 is used for image storage

    public User getAuthenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + email));
    }

    @Transactional
    public User updateProfile(String email, UserProfileUpdateRequest request) {
        User user = getAuthenticatedUser(email);

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail()); // Consider re-authentication or verification if email changes
        // Update patient/medecin specific fields if necessary, e.g., telephone, adresse, antecedentsMedicaux
        // This would require fetching the Patient/Medecin entity and updating it

        return userRepository.save(user);
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

    @Transactional
    public String uploadProfileImage(String email, MultipartFile file) throws IOException {
        User user = getAuthenticatedUser(email);

        // For simplicity, let's just store a dummy URL. In a real app, integrate with S3 or another storage.
        String imageUrl = "https://example.com/profile-images/" + user.getIdUtilisateur() + "/" + file.getOriginalFilename();
        // Example with S3:
        // String imageUrl = s3Service.uploadFile(file, "profile-images/" + user.getIdUtilisateur());

        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }

    public Optional<String> getProfileImageUrl(String email) {
        return userRepository.findByEmail(email).map(User::getProfileImageUrl);
    }
}
