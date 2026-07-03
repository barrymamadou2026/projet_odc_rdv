package com.odc.backend_medic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;

/**
 * Convertit une adresse texte en coordonnées GPS (latitude/longitude) via
 * Nominatim (OpenStreetMap) — service public, gratuit, sans clé API.
 *
 * Utilisé quand l'admin crée un médecin sans fournir directement lat/lng :
 * on géocode automatiquement son "adresse" pour permettre la recherche
 * "hôpitaux à proximité" côté patient.
 */
@Slf4j
@Service
public class GeocodingService {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record Coordonnees(double latitude, double longitude) {}

    public Optional<Coordonnees> geocoder(String adresse) {
        if (adresse == null || adresse.isBlank()) return Optional.empty();

        try {
            String url = UriComponentsBuilder.fromUriString(NOMINATIM_URL)
                    .queryParam("q", adresse)
                    .queryParam("format", "json")
                    .queryParam("limit", 1)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            // Nominatim exige un User-Agent identifiable (règle d'usage du service public).
            headers.set("User-Agent", "MedConnectODC/1.0 (contact: no-reply@medconnect-odc.com)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode results = objectMapper.readTree(response.getBody());

            if (results.isArray() && !results.isEmpty()) {
                JsonNode first = results.get(0);
                double lat = Double.parseDouble(first.get("lat").asText());
                double lon = Double.parseDouble(first.get("lon").asText());
                return Optional.of(new Coordonnees(lat, lon));
            }
        } catch (Exception e) {
            log.warn("Géocodage impossible pour l'adresse '{}': {}", adresse, e.getMessage());
        }
        return Optional.empty();
    }

    /** Distance en kilomètres entre deux points GPS (formule de Haversine). */
    public static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int rayonTerreKm = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return rayonTerreKm * c;
    }
}
