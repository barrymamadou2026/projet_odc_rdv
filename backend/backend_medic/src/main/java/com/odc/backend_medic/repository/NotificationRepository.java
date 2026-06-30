package com.odc.backend_medic.repository;

import com.odc.backend_medic.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByDateEnvoiDesc(com.odc.backend_medic.models.User user);

    List<Notification> findByUser_IdUtilisateurAndEstLuFalse(Long idUtilisateur);

    long countByUser_IdUtilisateurAndEstLuFalse(Long idUtilisateur);
}