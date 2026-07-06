package com.odc.backend_medic.exception;

import com.odc.backend_medic.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;

/**
 * Gestionnaire d'exceptions global. Avant ce fichier, un upload trop volumineux
 * (MaxUploadSizeExceededException) n'était jamais intercepté par un @ExceptionHandler
 * de contrôleur (elle est levée par le filtre multipart, AVANT d'atteindre le
 * contrôleur) — Spring renvoyait donc une page d'erreur générique HTML/500 au lieu
 * d'un message clair, et le frontend affichait une erreur incompréhensible.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        ApiErrorResponse error = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.PAYLOAD_TOO_LARGE.value())
                .error("Fichier trop volumineux")
                .message("Le fichier envoyé dépasse la taille maximale autorisée par le serveur (10 Mo). Réduisez la taille de l'image et réessayez.")
                .build();
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }

    // Avant ces handlers, une IllegalArgumentException/IllegalStateException/
    // AccessDeniedException levée depuis un service (ex: confirmation d'un
    // rendez-vous) n'était interceptée nulle part et remontait en 500 générique
    // (ou pire, un 404 "Not Found" trompeur quand le code appelant l'avalait dans
    // un .orElse(notFound())). On renvoie maintenant un message clair et le bon code HTTP.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ApiErrorResponse error = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Introuvable")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalState(IllegalStateException ex) {
        ApiErrorResponse error = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflit")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        ApiErrorResponse error = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Accès refusé")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
}
