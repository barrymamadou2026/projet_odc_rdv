package com.odc.backend_medic.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateDisponibiliteRequest {

    @NotNull
    @Future(message = "Le créneau doit être dans le futur")
    private LocalDateTime dateDebut;

    @NotNull
    @Future(message = "Le créneau doit être dans le futur")
    private LocalDateTime dateFin;

    @NotNull
    private int duree;
}
