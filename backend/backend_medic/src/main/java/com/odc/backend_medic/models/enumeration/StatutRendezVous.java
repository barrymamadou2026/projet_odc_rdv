package com.odc.backend_medic.models.enumeration;

/**
 * Statut du cycle de vie d'un rendez-vous.
 * Une annulation est une mise à jour de statut, jamais une suppression
 * de ligne (cohérent avec l'exigence de traçabilité du projet).
 */
public enum StatutRendezVous {
    ATTENTE,
    CONFIRME,
    ANNULE
}