package com.odc.backend_medic.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Remplace le comportement par défaut de Spring Security (qui renvoie un 403
 * avec une page d'erreur HTML du conteneur, sans en-têtes CORS) par une
 * réponse JSON 401 propre, avec les en-têtes CORS toujours présents.
 *
 * Sans ce correctif, une requête avec un token JWT absent/expiré/invalide
 * recevait une page d'erreur HTML sans Access-Control-Allow-Origin,
 * ce que Chrome bloque ensuite côté client via OpaqueResponseBlocking (ORB).
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:5173", "http://localhost:8080", "http://localhost:8081", "http://localhost:3000"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        applyCorsHeaders(request, response);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "status", 401,
                "error", "Non authentifié",
                "message", "Votre session a expiré ou est invalide. Veuillez vous reconnecter."
        )));
    }

    static void applyCorsHeaders(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Vary", "Origin");
        }
    }
}
