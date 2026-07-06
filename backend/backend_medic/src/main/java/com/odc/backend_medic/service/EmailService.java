package com.odc.backend_medic.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.odc.backend_medic.util.AwsSignatureV4;
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
 * Cinq fournisseurs supportés, sélectionnables via APP_MAIL_PROVIDER
 * ("brevo", "sendgrid", "mailjet", "zeptomail" ou "ses" — "brevo" par
 * défaut) — pratique quand un fournisseur bloque/rejette le compte (vécu
 * avec Brevo qui n'envoyait jamais l'email de vérification, SendGrid qui a
 * refusé d'activer le compte après vetting anti-fraude, et Mailjet dont le
 * compte a été bloqué après quelques envois). NOTE : Mailgun et Mailjet
 * appartiennent tous les deux à Sinch — inutile d'essayer Mailgun si Mailjet
 * est bloqué. ZeptoMail exige de vérifier un DOMAINE entier via DNS (pas
 * possible sans nom de domaine à soi) — inutilisable ici sans domaine.
 * AWS SES ("ses") est la meilleure option sans domaine : il permet de
 * vérifier une simple adresse email (comme les autres) et ne fait pas de
 * vetting automatique agressif à l'inscription — juste une demande écrite
 * de "production access" à approuver manuellement par AWS.
 *
 *   APP_MAIL_PROVIDER        -> "brevo" (défaut), "sendgrid", "mailjet", "zeptomail" ou "ses"
 *   APP_BREVO_API_KEY        -> clé API Brevo (si provider=brevo)
 *   APP_SENDGRID_API_KEY     -> clé API SendGrid (si provider=sendgrid)
 *   APP_MAILJET_API_KEY      -> clé API publique Mailjet (si provider=mailjet)
 *   APP_MAILJET_API_SECRET   -> clé API secrète Mailjet (si provider=mailjet)
 *   APP_ZEPTOMAIL_API_KEY    -> jeton d'envoi Zoho ZeptoMail (si provider=zeptomail)
 *   APP_AWS_ACCESS_KEY_ID    -> clé d'accès IAM (si provider=ses)
 *   APP_AWS_SECRET_ACCESS_KEY-> clé secrète IAM (si provider=ses)
 *   APP_AWS_REGION           -> région SES, ex: eu-west-1 (si provider=ses)
 *   APP_MAIL_FROM            -> adresse expéditeur (doit être vérifiée chez le fournisseur)
 *   APP_MAIL_FROM_NAME       -> nom affiché de l'expéditeur (optionnel)
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
    private static final String ZEPTOMAIL_ENDPOINT = "https://api.zeptomail.com/v1.1/email";

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

    @Value("${app.zeptomail.api-key:}")
    private String zeptomailApiKey;

    @Value("${app.aws.access-key-id:}")
    private String awsAccessKeyId;

    @Value("${app.aws.secret-access-key:}")
    private String awsSecretAccessKey;

    @Value("${app.aws.region:eu-west-1}")
    private String awsRegion;

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
                case "zeptomail" -> {
                    if (zeptomailApiKey == null || zeptomailApiKey.isBlank()) {
                        log.warn("Email non envoyé (APP_ZEPTOMAIL_API_KEY non configurée) - destinataire: {}, sujet: {}", to, subject);
                        return;
                    }
                    response = sendViaZeptomail(to, subject, htmlBody, zeptomailApiKey);
                }
                case "ses" -> {
                    if (awsAccessKeyId == null || awsAccessKeyId.isBlank() || awsSecretAccessKey == null || awsSecretAccessKey.isBlank()) {
                        log.warn("Email non envoyé (APP_AWS_ACCESS_KEY_ID / APP_AWS_SECRET_ACCESS_KEY non configurées) - destinataire: {}, sujet: {}", to, subject);
                        return;
                    }
                    response = sendViaSes(to, subject, htmlBody);
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

    private HttpResponse<String> sendViaZeptomail(String to, String subject, String htmlBody, String apiKey) throws Exception {
        Map<String, Object> fromEntry = new HashMap<>();
        fromEntry.put("address", from);
        fromEntry.put("name", fromName);

        Map<String, Object> toAddress = new HashMap<>();
        toAddress.put("address", to);

        Map<String, Object> toEntry = new HashMap<>();
        toEntry.put("email_address", toAddress);

        Map<String, Object> payload = new HashMap<>();
        payload.put("from", fromEntry);
        payload.put("to", List.of(toEntry));
        payload.put("subject", subject);
        payload.put("htmlbody", htmlBody);

        String json = objectMapper.writeValueAsString(payload);

        // Le jeton copié depuis le dashboard Zoho commence déjà par "Zoho-enczapikey ".
        // On l'accepte tel quel, ou on ajoute le préfixe si l'utilisateur n'a collé que la clé.
        String authHeader = apiKey.startsWith("Zoho-enczapikey") ? apiKey : "Zoho-enczapikey " + apiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ZEPTOMAIL_ENDPOINT))
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .header("authorization", authHeader)
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> sendViaSes(String to, String subject, String htmlBody) throws Exception {
        String host = "email." + awsRegion + ".amazonaws.com";
        String uriPath = "/v2/email/outbound-emails";

        Map<String, Object> destination = new HashMap<>();
        destination.put("ToAddresses", List.of(to));

        Map<String, Object> subjectPart = new HashMap<>();
        subjectPart.put("Data", subject);
        subjectPart.put("Charset", "UTF-8");

        Map<String, Object> htmlPart = new HashMap<>();
        htmlPart.put("Data", htmlBody);
        htmlPart.put("Charset", "UTF-8");

        Map<String, Object> bodyPart = new HashMap<>();
        bodyPart.put("Html", htmlPart);

        Map<String, Object> simpleContent = new HashMap<>();
        simpleContent.put("Subject", subjectPart);
        simpleContent.put("Body", bodyPart);

        Map<String, Object> content = new HashMap<>();
        content.put("Simple", simpleContent);

        Map<String, Object> payload = new HashMap<>();
        payload.put("FromEmailAddress", fromName == null || fromName.isBlank() ? from : fromName + " <" + from + ">");
        payload.put("Destination", destination);
        payload.put("Content", content);

        String json = objectMapper.writeValueAsString(payload);

        AwsSignatureV4.SignedHeaders signed = AwsSignatureV4.sign(
                "POST", host, uriPath, awsRegion, "ses",
                awsAccessKeyId, awsSecretAccessKey, json);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://" + host + uriPath))
                .header("content-type", "application/json")
                .header("host", host)
                .header("x-amz-date", signed.amzDate())
                .header("authorization", signed.authorization())
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
