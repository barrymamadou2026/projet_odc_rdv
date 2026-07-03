package com.odc.backend_medic.repository;

import com.odc.backend_medic.models.EmailVerificationToken;
import com.odc.backend_medic.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByToken(String token);

    void deleteByUser(User user);
}
