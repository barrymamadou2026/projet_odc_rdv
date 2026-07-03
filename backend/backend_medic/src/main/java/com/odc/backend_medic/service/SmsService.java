package com.odc.backend_medic.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

/**
 * Envoi de SMS réels via l'API REST de Twilio (pas besoin du SDK complet :
 * un simple appel HTTP authentifié en Basic Auth suffit).
 *
 * Configuration via variables d'environnement :
 *   APP_TWILIO_ACCOUNT_SID, APP_TWILIO_AUTH_TOKEN, APP_TWILIO_FROM_NUMBER
 *
 * Si Twilio n'est pas configuré, l'envoi est simplement ignoré (loggé),
 * sans jamais faire échouer l'action métier associée (réservation, annulation...).
 */
@Service
@Slf4j
public class SmsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.twilio.auth-token:}")
    private String authToken;

    @Value("${app.twilio.from-number:}")
    private String fromNumber;

    public boolean isConfigured() {
        return accountSid != null && !accountSid.isBlank()
                && authToken != null && !authToken.isBlank()
                && fromNumber != null && !fromNumber.isBlank();
    }

    public void sendSms(String toNumber, String message) {
        if (!isConfigured()) {
            log.warn("SMS non envoyé (Twilio non configuré) - destinataire: {}", toNumber);
            return;
        }
        if (toNumber == null || toNumber.isBlank()) {
            log.warn("SMS non envoyé (numéro de téléphone manquant)");
            return;
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(accountSid, authToken);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("To", normalizeNumber(toNumber));
            body.add("From", fromNumber);
            body.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
            log.info("SMS envoyé à {}", toNumber);
        } catch (Exception e) {
            log.error("Échec de l'envoi du SMS à {} : {}", toNumber, e.getMessage());
        }
    }

    /** Ajoute l'indicatif Guinée (+224) si le numéro local ne commence pas déjà par '+'. */
    private String normalizeNumber(String number) {
        String cleaned = number.replaceAll("[\\s.-]", "");
        if (cleaned.startsWith("+")) {
            return cleaned;
        }
        if (cleaned.startsWith("00")) {
            return "+" + cleaned.substring(2);
        }
        if (cleaned.startsWith("0")) {
            return "+224" + cleaned.substring(1);
        }
        return "+224" + cleaned;
    }
}
