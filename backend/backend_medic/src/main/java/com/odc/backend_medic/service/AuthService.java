package com.odc.backend_medic.service;

import com.odc.backend_medic.dto.AdminLoginRequest;
import com.odc.backend_medic.dto.AuthResponse;
import com.odc.backend_medic.dto.LoginRequest;
import com.odc.backend_medic.dto.RegisterRequest;
import com.odc.backend_medic.models.EmailVerificationToken;
import com.odc.backend_medic.models.Patient;
import com.odc.backend_medic.models.PasswordResetToken;
import com.odc.backend_medic.models.User;
import com.odc.backend_medic.models.enumeration.Role;
import com.odc.backend_medic.repository.EmailVerificationTokenRepository;
import com.odc.backend_medic.repository.PasswordResetTokenRepository;
import com.odc.backend_medic.repository.PatientRepository;
import com.odc.backend_medic.repository.UserRepository;
import com.odc.backend_medic.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final EmailDomainValidator emailDomainValidator;
    private final EmailService emailService;

    @Value("${app.admin.secret-key}")
    private String adminSecretKey;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // ---------------------------------------------------------------------
    // Vérification d'email (double opt-in)
    // ---------------------------------------------------------------------

    @Transactional
    public void sendVerificationEmail(User user) {
        emailVerificationTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();
        emailVerificationTokenRepository.save(verificationToken);

        String verificationLink = frontendUrl + "/verify-email?token=" + token;
        emailService.sendVerificationEmail(user.getEmail(), user.getPrenom(), verificationLink);
    }

    @Transactional
    public boolean verifyEmail(String token) {
        // Le lien n'est PAS supprimé dès la première visite réussie (idempotent) :
        // les scanners anti-phishing des messageries (Gmail Safe Browsing, passerelles
        // email d'entreprise, antivirus...) visitent automatiquement les liens contenus
        // dans un email pour les analyser, AVANT que l'utilisateur ne clique lui-même.
        // Si on supprimait le token dès ce premier accès automatique, le vrai clic de
        // l'utilisateur juste après tombait sur "lien invalide ou expiré" alors que le
        // lien n'avait jamais vraiment été utilisé par lui. Le token reste donc valable
        // jusqu'à son expiration naturelle (24h) ou jusqu'à un nouvel envoi (qui le
        // remplace via resendVerificationEmail/sendVerificationEmail).
        return emailVerificationTokenRepository.findByToken(token)
                .filter(t -> t.getExpiryDate().isAfter(LocalDateTime.now()))
                .map(t -> {
                    User user = t.getUser();
                    if (!user.isEmailVerifie()) {
                        user.setEmailVerifie(true);
                        userRepository.save(user);
                    }
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (!user.isEmailVerifie()) {
                sendVerificationEmail(user);
            }
        });
        // Réponse volontairement identique que le compte existe ou non (anti-énumération d'emails).
    }

    // ---------------------------------------------------------------------
    // Mot de passe oublié
    // ---------------------------------------------------------------------

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

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);
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
        // Une réinitialisation de mot de passe volontaire lève aussi un éventuel verrouillage.
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }

    // ---------------------------------------------------------------------
    // Inscription
    // ---------------------------------------------------------------------

    @Transactional
    public AuthResponse registerPatient(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        // Vérification DNS (MX) : rejette immédiatement les domaines inexistants
        // ou les fautes de frappe évidentes, avant même de créer le compte.
        if (!emailDomainValidator.domaineAcceptable(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Cette adresse email semble invalide ou son domaine n'existe pas. Vérifiez l'orthographe.");
        }

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT)
                .estActif(true)
                .emailVerifie(false)
                .build();

        User savedUser = userRepository.save(user);

        Patient patient = Patient.builder()
                .user(savedUser)
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .antecedentsMedicaux(request.getAntecedentsMedicaux())
                .build();

        patientRepository.save(patient);

        sendVerificationEmail(savedUser);

        // Pas de token à l'inscription : le compte doit d'abord être vérifié
        // par email avant toute connexion (voir authenticateUser). On renvoie
        // uniquement les infos utiles pour le message de confirmation côté UI.
        return toAuthResponse(savedUser, null);
    }

    // ---------------------------------------------------------------------
    // Connexion (avec verrouillage anti-bruteforce + email vérifié requis)
    // ---------------------------------------------------------------------

    public AuthResponse authenticateUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null && user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            String until = user.getLockedUntil().format(DateTimeFormatter.ofPattern("HH:mm"));
            throw new BadCredentialsException(
                    "Compte temporairement verrouillé suite à plusieurs tentatives échouées. Réessayez après " + until + ".");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            registerFailedAttempt(user);
            throw new BadCredentialsException("Identifiants invalides");
        }

        if (user == null) {
            throw new BadCredentialsException("Identifiants invalides");
        }

        if (user.getRole() == Role.ADMIN) {
            throw new BadCredentialsException("Accès refusé.");
        }

        if (!user.isEmailVerifie()) {
            throw new BadCredentialsException(
                    "Veuillez confirmer votre adresse email avant de vous connecter. Consultez votre boîte de réception.");
        }

        resetFailedAttempts(user);

        String token = buildToken(user);
        return toAuthResponse(user, token);
    }

    public AuthResponse authenticateAdmin(AdminLoginRequest request) {
        if (!adminSecretKey.equals(request.getSecretKey())) {
            throw new BadCredentialsException("Clé secrète invalide.");
        }

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null && user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new BadCredentialsException("Compte temporairement verrouillé suite à plusieurs tentatives échouées.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            registerFailedAttempt(user);
            throw new BadCredentialsException("Identifiants invalides");
        }

        if (user == null || user.getRole() != Role.ADMIN) {
            throw new BadCredentialsException("Accès refusé.");
        }

        resetFailedAttempts(user);

        String token = buildToken(user);
        return toAuthResponse(user, token);
    }

    private void registerFailedAttempt(User user) {
        if (user == null) {
            return; // Ne rien révéler si l'email n'existe pas
        }
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
        if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            log.warn("Compte verrouillé après {} tentatives échouées : {}", MAX_FAILED_ATTEMPTS, user.getEmail());
        }
        userRepository.save(user);
    }

    private void resetFailedAttempts(User user) {
        if (user.getFailedLoginAttempts() != 0 || user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }
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
                .emailVerifie(user.isEmailVerifie())
                .build();
    }
}
