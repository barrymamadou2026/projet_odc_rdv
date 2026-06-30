package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.AdminLoginRequest;
import com.odc.backend_medic.dto.AuthResponse;
import com.odc.backend_medic.dto.LoginRequest;
import com.odc.backend_medic.dto.RegisterRequest;
import com.odc.backend_medic.models.Patient;
import com.odc.backend_medic.models.User;
import com.odc.backend_medic.models.enumeration.Role;
import com.odc.backend_medic.repository.PatientRepository;
import com.odc.backend_medic.repository.UserRepository;
import com.odc.backend_medic.repository.PasswordResetTokenRepository;
import com.odc.backend_medic.models.PasswordResetToken;
import com.odc.backend_medic.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${app.admin.secret-key}")
    private String adminSecretKey;

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec cet email."));

        // Supprimer les anciens tokens pour cet utilisateur
        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1)) // Token valide 1 heure
                .build();
        passwordResetTokenRepository.save(resetToken);

        // Envoyer un email à l'utilisateur avec le lien de réinitialisation contenant le token
        System.out.println("Password reset token for " + email + ": " + token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de réinitialisation invalide."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Token de réinitialisation expiré.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }

    @Transactional
    public AuthResponse registerPatient(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT)
                .estActif(true)
                .build();

        User savedUser = userRepository.save(user);

        Patient patient = Patient.builder()
                .user(savedUser)
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .antecedentsMedicaux(request.getAntecedentsMedicaux())
                .build();

        patientRepository.save(patient);

        String token = buildToken(savedUser);
        return toAuthResponse(savedUser, token);
    }

    public AuthResponse authenticateUser(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Identifiants invalides"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadCredentialsException("Accès refusé.");
        }

        String token = buildToken(user);
        return toAuthResponse(user, token);
    }

    public AuthResponse authenticateAdmin(AdminLoginRequest request) {
        if (!adminSecretKey.equals(request.getSecretKey())) {
            throw new BadCredentialsException("Clé secrète invalide.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Identifiants invalides"));

        if (user.getRole() != Role.ADMIN) {
            throw new BadCredentialsException("Accès refusé.");
        }

        String token = buildToken(user);
        return toAuthResponse(user, token);
    }

    private String buildToken(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        return jwtService.generateToken(userDetails, Map.of("role", user.getRole().name()));
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .email(user.getEmail())
                .build();
    }
}