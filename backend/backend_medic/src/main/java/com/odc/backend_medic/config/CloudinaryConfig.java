package com.odc.backend_medic.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary = stockage cloud persistant pour les photos de profil.
 *
 * Avant : les images étaient écrites sur le disque local du serveur Render,
 * qui est éphémère (tout fichier local est perdu à chaque redéploiement/
 * redémarrage). Cloudinary garde les fichiers indéfiniment et les sert via
 * un CDN, sans dépendre du cycle de vie du conteneur applicatif.
 *
 * Credentials à définir sur Render (compte gratuit sur cloudinary.com) :
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}
