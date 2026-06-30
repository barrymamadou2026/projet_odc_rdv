package com.odc.backend_medic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookRendezVousRequest {

    @NotNull
    private Long idDispo;

    @NotBlank(message = "Le motif de la consultation est requis")
    private String motif;
}