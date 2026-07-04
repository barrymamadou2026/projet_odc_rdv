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

    // Ne fait jamais partie de l'entité User (mot de passe) : le DTO garantit
    // qu'on ne renvoie jamais mot_de_passe au frontend, contrairement à
    // l'ancien code qui exposait l'entité User brute en JSON.
    private String profileImageUrl;

    // Ces champs vivent sur Patient/Medecin en base, pas sur User — d'où le
    // paramètre supplémentaire dans fromEntity pour les injecter proprement.
    private String telephone;
    private String adresse;
    private String antecedentsMedicaux;

    public static UserResponse fromEntity(User user) {
        return fromEntity(user, null, null, null);
    }

    public static UserResponse fromEntity(User user, String telephone, String adresse, String antecedentsMedicaux) {
        return UserResponse.builder()
                .idUtilisateur(user.getIdUtilisateur())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole())
                .estActif(user.isEstActif())
                .profileImageUrl(user.getProfileImageUrl())
                .telephone(telephone)
                .adresse(adresse)
                .antecedentsMedicaux(antecedentsMedicaux)
                .build();
    }
}
