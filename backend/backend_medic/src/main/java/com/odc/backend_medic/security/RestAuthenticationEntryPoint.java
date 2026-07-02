package com.odc.backend_medic.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Remplace le comportement par défaut de Spring Security par une
 * réponse JSON 401 propre, avec les en-têtes CORS dynamiques toujours présents.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final List<String> allowedOrigins;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Injection de la variable d'environnement Render (avec localhost par défaut)
    public RestAuthenticationEntryPoint(@Value("${APP_CORS_ALLOWED_ORIGINS:http://localhost:5173}") String allowedOrigin) {
        this.allowedOrigins = List.of(
                "http://localhost:5173", 
                "http://localhost:8080", 
                "http://localhost:8081", 
                "http://localhost:3000",
                allowedOrigin // Ton URL Vercel est maintenant prise en compte ici !
        );
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        applyCorsHeaders(request, response);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8"); // UTF-8 règle le problème des caractères accentués comme "expir"
        response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "status", 401,
                "error", "Non authentifié",
                "message", "Votre session a expiré ou est invalide. Veuillez vous reconnecter."
        )));
    }

    public void applyCorsHeaders(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        if (origin != null && allowedOrigins.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Vary", "Origin");
        }
    }
}