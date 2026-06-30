package com.odc.backend_medic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * La clé secrète est ici aussi un champ de DTO classique : elle est
 * désormais revérifiée côté serveur (voir AuthController), pas
 * seulement côté React.
 */
@Data
public class AdminLoginRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String secretKey;
}
