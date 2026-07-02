package com.odc.backend_medic.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Expose le répertoire physique de stockage des fichiers uploadés
 * (photos de profil, etc.) en tant que ressources statiques HTTP,
 * afin que les URLs renvoyées par l'API soient réellement accessibles
 * par le navigateur (résout le blocage OpaqueResponseBlocking observé
 * quand l'URL renvoyée était une URL factice inaccessible).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = new File(uploadDir).getAbsolutePath();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + File.separator);
    }
}
