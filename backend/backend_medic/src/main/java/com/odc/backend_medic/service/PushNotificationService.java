package com.odc.backend_medic.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

/**
 * Envoi de notifications push web via Firebase Cloud Messaging (FCM).
 *
 * Alternative aux emails pour les notifications de rendez-vous (créneau,
 * confirmation, annulation, rappel) : ne dépend d'aucun fournisseur email
 * tiers (Brevo/SendGrid/Mailjet/etc.) et donc contourne complètement les
 * problèmes de vérification/blocage de compte rencontrés jusqu'ici.
 * Ne remplace PAS l'email pour la vérification de compte / mot de passe
 * oublié (l'utilisateur n'a pas encore de jeton push à ce moment-là).
 *
 * Configuration requise (Render) :
 *   APP_FIREBASE_SERVICE_ACCOUNT_JSON -> le contenu JSON complet du fichier
 *     de clé de compte de service, téléchargé depuis Firebase Console >
 *     Paramètres du projet > Comptes de service > "Générer une nouvelle
 *     clé privée". Coller le JSON tel quel (une seule ligne ou multi-lignes,
 *     les deux fonctionnent) dans la variable d'environnement.
 *
 * Si la variable n'est pas configurée, le service reste inactif (log un
 * avertissement une seule fois) sans jamais faire planter l'application.
 */
@Service
@Slf4j
public class PushNotificationService {

    @Value("${app.firebase.service-account-json:}")
    private String serviceAccountJson;

    private volatile boolean initialized = false;
    private volatile boolean available = false;

    @PostConstruct
    private void init() {
        if (serviceAccountJson == null || serviceAccountJson.isBlank()) {
            log.warn("Notifications push désactivées (APP_FIREBASE_SERVICE_ACCOUNT_JSON non configurée).");
            return;
        }
        try {
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8)));

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
            available = true;
            log.info("Firebase Cloud Messaging initialisé avec succès.");
        } catch (Exception e) {
            log.error("Échec de l'initialisation de Firebase Cloud Messaging: {}", e.getMessage());
        } finally {
            initialized = true;
        }
    }

    public boolean isAvailable() {
        return initialized && available;
    }

    /**
     * Envoie une notification push à un jeton FCM donné. Échoue silencieusement
     * (log uniquement) si Firebase n'est pas configuré ou si le jeton est invalide
     * (ex: navigateur désinscrit) — ne doit jamais interrompre le flux appelant.
     */
    public void sendPush(String fcmToken, String title, String body) {
        if (!isAvailable() || fcmToken == null || fcmToken.isBlank()) {
            return;
        }
        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();
            FirebaseMessaging.getInstance().send(message);
        } catch (FirebaseMessagingException e) {
            log.warn("Échec de l'envoi de la notification push (jeton probablement expiré/invalide): {}", e.getMessage());
        } catch (Exception e) {
            log.error("Erreur inattendue lors de l'envoi de la notification push: {}", e.getMessage());
        }
    }
}
