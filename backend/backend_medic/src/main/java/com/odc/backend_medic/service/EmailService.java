package com.odc.backend_medic.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Envoi d'emails réels (SMTP) : vérification de compte, réinitialisation de
 * mot de passe, notifications de rendez-vous.
 *
 * Configuration via variables d'environnement (voir application.properties) :
 *   SPRING_MAIL_HOST, SPRING_MAIL_PORT, SPRING_MAIL_USERNAME, SPRING_MAIL_PASSWORD
 *   APP_MAIL_FROM
 *
 * Si le SMTP n'est pas configuré, les envois échouent silencieusement (loggés en
 * WARN) pour ne jamais bloquer une inscription ou une action métier.
 */
@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@medconnect-odc.com}")
    private String from;

    @Value("${app.mail.enabled:true}")
    private boolean enabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendHtml(String to, String subject, String htmlBody) {
        if (!enabled || to == null || to.isBlank()) {
            log.warn("Email non envoyé (désactivé ou destinataire manquant) - sujet: {}", subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email envoyé à {} - sujet: {}", to, subject);
        } catch (Exception e) {
            log.error("Échec de l'envoi d'email à {} : {}", to, e.getMessage());
        }
    }

    public void sendVerificationEmail(String to, String prenom, String verificationLink) {
        String subject = "MedConnect ODC - Confirmez votre adresse email";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
                  <h2 style="color:#f97316">Bienvenue %s !</h2>
                  <p>Merci de vous être inscrit(e) sur <strong>MedConnect ODC</strong>.</p>
                  <p>Pour activer votre compte et confirmer que cette adresse vous appartient bien, cliquez sur le bouton ci-dessous :</p>
                  <p style="text-align:center;margin:30px 0">
                    <a href="%s" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Confirmer mon email</a>
                  </p>
                  <p>Ou copiez ce lien dans votre navigateur :<br><a href="%s">%s</a></p>
                  <p style="color:#888;font-size:12px">Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
                </div>
                """.formatted(prenom, verificationLink, verificationLink, verificationLink);
        sendHtml(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "MedConnect ODC - Réinitialisation de votre mot de passe";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
                  <h2 style="color:#f97316">Réinitialisation de mot de passe</h2>
                  <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                  <p style="text-align:center;margin:30px 0">
                    <a href="%s" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Réinitialiser mon mot de passe</a>
                  </p>
                  <p>Ou copiez ce lien dans votre navigateur :<br><a href="%s">%s</a></p>
                  <p style="color:#888;font-size:12px">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
                </div>
                """.formatted(resetLink, resetLink, resetLink);
        sendHtml(to, subject, body);
    }

    public void sendAppointmentNotification(String to, String subject, String message) {
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
                  <h2 style="color:#f97316">MedConnect ODC</h2>
                  <p>%s</p>
                </div>
                """.formatted(message);
        sendHtml(to, subject, body);
    }
}
