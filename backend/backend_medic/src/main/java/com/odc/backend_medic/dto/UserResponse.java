package com.odc.backend_medic.dto;

import com.odc.backend_medic.models.User;
import com.odc.backend_medic.models.enumeration.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
    private boolean estActif;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .idUtilisateur(user.getIdUtilisateur())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole())
                .estActif(user.isEstActif())
                .build();
    }
}