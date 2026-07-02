package com.odc.backend_medic.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * Réponse JSON 403 propre (utilisateur authentifié mais rôle insuffisant),
 * avec en-têtes CORS toujours présents — voir RestAuthenticationEntryPoint
 * pour le cas 401 (non authentifié).
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        RestAuthenticationEntryPoint.applyCorsHeaders(request, response);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "status", 403,
                "error", "Accès refusé",
                "message", "Vous n'avez pas les droits nécessaires pour accéder à cette ressource."
        )));
    }
}
