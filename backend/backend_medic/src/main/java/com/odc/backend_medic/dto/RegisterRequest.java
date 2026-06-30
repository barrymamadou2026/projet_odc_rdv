package com.odc.backend_medic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Formulaire d'inscription public pour les PATIENTS.
 * Intègre désormais les coordonnées physiques requises par la table patients.
 */
@Data
public class RegisterRequest {

    @NotBlank
    @Size(max = 50)
    private String nom;

    @NotBlank
    @Size(max = 50)
    private String prenom;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @NotBlank
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String password;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Size(max = 20)
    private String telephone;

    private String adresse;

    private String antecedentsMedicaux; // Optionnel lors de l'inscription initiale
}