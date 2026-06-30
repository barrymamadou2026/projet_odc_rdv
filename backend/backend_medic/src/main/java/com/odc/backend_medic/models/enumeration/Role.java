package com.odc.backend_medic.models.enumeration;

/**
 * Rôles applicatifs. Stocké en base via @Enumerated(EnumType.STRING)
 * pour rester lisible dans la colonne ENUM('PATIENT','MEDECIN','ADMIN').
 */
public enum Role {
    PATIENT,
    MEDECIN,
    ADMIN
}