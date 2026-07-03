package com.odc.backend_medic.controller;

import com.odc.backend_medic.dto.AdminLoginRequest;
import com.odc.backend_medic.dto.AuthResponse;
import com.odc.backend_medic.dto.LoginRequest;
import com.odc.backend_medic.dto.RegisterRequest;
import com.odc.backend_medic.dto.ForgotPasswordRequest;
import com.odc.backend_medic.dto.ResetPasswordRequest;
import com.odc.backend_medic.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.requestPasswordReset(request.getEmail());
            return ResponseEntity.ok("Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok("Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Votre mot de passe a été réinitialisé avec succès.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.registerPatient(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.authenticateUser(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        try {
            AuthResponse response = authService.authenticateAdmin(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Lien cliqué depuis l'email de vérification. Renvoie directement une
     * page HTML (pas besoin de route frontend dédiée).
     */
    @GetMapping(value = "/verify-email", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token, HttpServletResponse response) {
        boolean success = authService.verifyEmail(token);
        String html = success ? successPage() : errorPage();
        return ResponseEntity.ok(html);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok("Si un compte non vérifié existe avec cet email, un nouvel email a été envoyé.");
    }

    private String successPage() {
        return """
                <html><body style="font-family:Arial,sans-serif;text-align:center;margin-top:80px">
                <h1 style="color:#f97316">✅ Email confirmé !</h1>
                <p>Votre compte MedConnect ODC est maintenant actif.</p>
                <p>Vous pouvez fermer cette page et vous connecter.</p>
                </body></html>
                """;
    }

    private String errorPage() {
        return """
                <html><body style="font-family:Arial,sans-serif;text-align:center;margin-top:80px">
                <h1 style="color:#dc2626">❌ Lien invalide ou expiré</h1>
                <p>Demandez un nouvel email de confirmation depuis la page de connexion.</p>
                </body></html>
                """;
    }
}
