package com.odc.backend_medic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConsultationRequest {

    @NotBlank(message = "Le diagnostic est obligatoire")
    private String diagnostic;

    private String notesMedicales;

    @NotBlank(message = "L'ordonnance est obligatoire")
    private String ordonnance;
}