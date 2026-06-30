package com.odc.backend_medic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Format homogène pour toutes les erreurs renvoyées par l'API
 * (échec de validation, identifiants invalides, accès refusé...).
 *
 * Ce DTO seul ne fait rien : il devra être renvoyé par un gestionnaire
 * d'exceptions global (@RestControllerAdvice), qu'on mettra dans un
 * futur dossier "exception" — on s'en occupera quand on y arrivera.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private List<String> details;
}
