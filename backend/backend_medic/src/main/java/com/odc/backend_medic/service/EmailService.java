package com.odc.backend_medic.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Envoi d'emails réels via une API HTTP (PAS via SMTP).
 *
 * Pourquoi pas SMTP : Render bloque tout trafic sortant vers les ports SMTP
 * (25, 465, 587) sur les web services, y compris le tier gratuit. C'est un
 * blocage réseau au niveau de la plateforme d'hébergement, pas un bug du code
 * ni une mauvaise config Gmail. La solution standard est de basculer sur une
 * API d'envoi d'email en HTTPS (port 443, jamais bloqué).
 *
 * Trois fournisseurs supportés, sélectionnables via APP_MAIL_PROVIDER
 * ("brevo", "sendgrid" ou "mailjet" — "brevo" par défaut) — pratique quand un
 * fournisseur bloque/rejette la création de compte (vécu avec Brevo qui
 * n'envoyait jamais l'email de vérification, et SendGrid qui a carrément
 * refusé d'activer le compte après vetting anti-fraude) :
 *
 *   APP_MAIL_PROVIDER      -> "brevo" (défaut), "sendgrid" ou "mailjet"
 *   APP_BREVO_API_KEY      -> clé API Brevo (si provider=brevo)
 *   APP_SENDGRID_API_KEY   -> clé API SendGrid (si provider=sendgrid)
 *   APP_MAILJET_API_KEY    -> clé API publique Mailjet (si provider=mailjet)
 *   APP_MAILJET_API_SECRET -> clé API secrète Mailjet (si provider=mailjet)
 *   APP_MAIL_FROM          -> adresse expéditeur (doit être vérifiée chez le fournisseur)
 *   APP_MAIL_FROM_NAME     -> nom affiché de l'expéditeur (optionnel)
 *
 * Si la configuration du fournisseur actif est incomplète, les envois
 * échouent silencieusement (loggés en WARN) pour ne jamais bloquer une
 * inscription ou une action métier.
 */
@Service
@Slf4j
public class EmailService {

    private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
    private static final String SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send";
    private static final String MAILJET_ENDPOINT = "https://api.mailjet.com/v3.1/send";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${app.mail.provider:brevo}")
    private String provider;

    @Value("${app.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.sendgrid.api-key:}")
    private String sendgridApiKey;

    @Value("${app.mailjet.api-key:}")
    private String mailjetApiKey;

    @Value("${app.mailjet.api-secret:}")
    private String mailjetApiSecret;

    @Value("${app.mail.from:no-reply@medconnect-odc.com}")
    private String from;

    @Value("${app.mail.from-name:MedConnect ODC}")
    private String fromName;

    @Value("${app.mail.enabled:true}")
    private boolean enabled;

    public EmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendHtml(String to, String subject, String htmlBody) {
        if (!enabled || to == null || to.isBlank()) {
            log.warn("Email non envoyé (désactivé ou destinataire manquant) - sujet: {}", subject);
            return;
        }

        String activeProvider = provider == null ? "brevo" : provider.toLowerCase();

        try {
            HttpResponse<String> response;
            switch (activeProvider) {
                case "sendgrid" -> {
                    if (sendgridApiKey == null || sendgridApiKey.isBlank()) {
                        log.warn("Email non envoyé (APP_SENDGRID_API_KEY non configurée) - destinataire: {}, sujet: {}", to, subject);
                        return;
                    }
                    response = sendViaSendgrid(to, subject, htmlBody, sendgridApiKey);
                }
                case "mailjet" -> {
                    if (mailjetApiKey == null || mailjetApiKey.isBlank() || mailjetApiSecret == null || mailjetApiSecret.isBlank()) {
                        log.warn("Email non envoyé (APP_MAILJET_API_KEY / APP_MAILJET_API_SECRET non configurées) - destinataire: {}, sujet: {}", to, subject);
                        return;
                    }
                    response = sendViaMailjet(to, subject, htmlBody, mailjetApiKey, mailjetApiSecret);
                }
                default -> {
                    if (brevoApiKey == null || brevoApiKey.isBlank()) {
                        log.warn("Email non envoyé (APP_BREVO_API_KEY non configurée) - destinataire: {}, sujet: {}", to, subject);
                        return;
                    }
                    response = sendViaBrevo(to, subject, htmlBody, brevoApiKey);
                }
            }

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email envoyé à {} via {} - sujet: {}", to, activeProvider, subject);
            } else {
                log.error("Échec de l'envoi d'email à {} via {} : HTTP {} - {}",
                        to, activeProvider, response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Échec de l'envoi d'email à {} : {}", to, e.getMessage());
        }
    }

    private HttpResponse<String> sendViaBrevo(String to, String subject, String htmlBody, String apiKey) throws Exception {
        Map<String, Object> sender = new HashMap<>();
        sender.put("email", from);
        sender.put("name", fromName);

        Map<String, Object> recipient = new HashMap<>();
        recipient.put("email", to);

        Map<String, Object> payload = new HashMap<>();
        payload.put("sender", sender);
        payload.put("to", List.of(recipient));
        payload.put("subject", subject);
        payload.put("htmlContent", htmlBody);

        String json = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BREVO_ENDPOINT))
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .header("api-key", apiKey)
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> sendViaSendgrid(String to, String subject, String htmlBody, String apiKey) throws Exception {
        Map<String, Object> toEntry = new HashMap<>();
        toEntry.put("email", to);

        Map<String, Object> personalization = new HashMap<>();
        personalization.put("to", List.of(toEntry));

        Map<String, Object> fromEntry = new HashMap<>();
        fromEntry.put("email", from);
        fromEntry.put("name", fromName);

        Map<String, Object> contentEntry = new HashMap<>();
        contentEntry.put("type", "text/html");
        contentEntry.put("value", htmlBody);

        Map<String, Object> payload = new HashMap<>();
        payload.put("personalizations", List.of(personalization));
        payload.put("from", fromEntry);
        payload.put("subject", subject);
        List<Object> contents = new ArrayList<>();
        contents.add(contentEntry);
        payload.put("content", contents);

        String json = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SENDGRID_ENDPOINT))
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .header("authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> sendViaMailjet(String to, String subject, String htmlBody, String apiKey, String apiSecret) throws Exception {
        Map<String, Object> fromEntry = new HashMap<>();
        fromEntry.put("Email", from);
        fromEntry.put("Name", fromName);

        Map<String, Object> toEntry = new HashMap<>();
        toEntry.put("Email", to);

        Map<String, Object> message = new HashMap<>();
        message.put("From", fromEntry);
        message.put("To", List.of(toEntry));
        message.put("Subject", subject);
        message.put("HTMLPart", htmlBody);

        Map<String, Object> payload = new HashMap<>();
        payload.put("Messages", List.of(message));

        String json = objectMapper.writeValueAsString(payload);

        String basicAuth = Base64.getEncoder().encodeToString((apiKey + ":" + apiSecret).getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(MAILJET_ENDPOINT))
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .header("authorization", "Basic " + basicAuth)
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
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
                  <h2 style="color:#f97316">%s</h2>
                  <p>%s</p>
                </div>
                """.formatted(subject, message);
        sendHtml(to, "MedConnect ODC - " + subject, body);
    }
}
