package com.odc.backend_medic.security;

import com.odc.backend_medic.models.User;
import com.odc.backend_medic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Pont entre votre entité User et Spring Security.
 * L'identifiant de connexion est l'email (pas un username séparé).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Aucun compte pour : " + email));

        if (!user.isEstActif()) {
            // Un compte désactivé par l'admin ne doit plus pouvoir s'authentifier
            throw new UsernameNotFoundException("Compte désactivé : " + email);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword()) // déjà un hash BCrypt en base
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
