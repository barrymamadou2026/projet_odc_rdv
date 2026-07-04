package com.odc.backend_medic.config;

import com.odc.backend_medic.security.JwtAuthenticationFilter;
import com.odc.backend_medic.security.RateLimitFilter;
import com.odc.backend_medic.security.RestAccessDeniedHandler;
import com.odc.backend_medic.security.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * - Stateless : pas de session, tout repose sur le JWT à chaque requête.
 * - CSRF désactivé : pertinent uniquement pour les formulaires HTML classiques.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Permet d'utiliser @PreAuthorize sur les contrôleurs au besoin
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    // Récupère l'URL Vercel configurée sur Render. Si elle n'est pas définie, utilise localhost:5173 par défaut.
    @Value("${APP_CORS_ALLOWED_ORIGINS:http://localhost:5173}")
    private String allowedOrigin;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Ajout des origines locales et de l'origine dynamique récupérée depuis Render
        configuration.setAllowedOrigins(java.util.Arrays.asList(
            "http://localhost:5173", 
            "http://localhost:8080", 
            "http://localhost:8081", 
            "http://localhost:3000",
            allowedOrigin
        ));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // En-têtes de sécurité additionnels (défense en profondeur).
            .headers(headers -> headers
                    .frameOptions(frame -> frame.deny())
                    .contentTypeOptions(contentTypeOptions -> {})
                    .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(restAuthenticationEntryPoint)   // 401 JSON propre (non authentifié) au lieu du 403 HTML par défaut
                .accessDeniedHandler(restAccessDeniedHandler)             // 403 JSON propre (rôle insuffisant)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                
                // CORRECTION : Ajout de "/error" dans la liste publique pour lever le masque sur les exceptions SQL/DB
                .requestMatchers("/api/auth/**", "/auth/**", "/error").permitAll()       // login, inscription, vérification email, erreurs système
                .requestMatchers("/uploads/**").permitAll()        // fichiers statiques publics (photos de profil)
                .requestMatchers("/api/public/**").permitAll()      // statistiques publiques de la page d'accueil
                
                // Correction ici : Accepter les rôles avec OU sans le préfixe "ROLE_"
                .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN", "ADMIN")
                .requestMatchers("/api/medecin/**").hasAnyAuthority("ROLE_MEDECIN", "MEDECIN")
                .requestMatchers("/api/patient/**").hasAnyAuthority("ROLE_PATIENT", "PATIENT")
                
                // Routes communes/partagées si elles existent
                .requestMatchers("/api/consultations/**").hasAnyAuthority("ROLE_MEDECIN", "MEDECIN", "ROLE_PATIENT", "PATIENT")
                .requestMatchers("/api/rendez-vous/**").hasAnyAuthority("ROLE_MEDECIN", "MEDECIN", "ROLE_PATIENT", "PATIENT")
                .requestMatchers("/api/notifications/**").hasAnyAuthority("ROLE_MEDECIN", "MEDECIN", "ROLE_PATIENT", "PATIENT", "ROLE_ADMIN", "ADMIN")
                .requestMatchers("/api/users/**").authenticated()
                
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
