package com.bisoshi.karta.modules.audit.repository;

import com.bisoshi.karta.modules.audit.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    List<ActivityLog> findAllByOrderByTimestampDesc();

    List<ActivityLog> findByUserIdOrderByTimestampDesc(UUID userId);

    List<ActivityLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    List<ActivityLog> findByUserIdAndTimestampBetweenOrderByTimestampDesc(UUID userId, LocalDateTime start, LocalDateTime end);

    List<ActivityLog> findByActionOrderByTimestampDesc(String action);

    List<ActivityLog> findByModuleOrderByTimestampDesc(String module);

    List<ActivityLog> findByModuleAndTimestampBetweenOrderByTimestampDesc(String module, LocalDateTime start, LocalDateTime end);

    List<ActivityLog> findByActionAndTimestampBetweenOrderByTimestampDesc(String action, LocalDateTime start, LocalDateTime end);

    List<ActivityLog> findByUserIdAndModuleAndTimestampBetweenOrderByTimestampDesc(
            UUID userId, String module, LocalDateTime start, LocalDateTime end);

    List<ActivityLog> findByUserIdAndActionAndTimestampBetweenOrderByTimestampDesc(
            UUID userId, String action, LocalDateTime start, LocalDateTime end);

    List<ActivityLog> findByModuleAndActionAndTimestampBetweenOrderByTimestampDesc(
            String module, String action, LocalDateTime start, LocalDateTime end);

    List<ActivityLog> findByUserIdAndModuleAndActionAndTimestampBetweenOrderByTimestampDesc(
            UUID userId, String module, String action, LocalDateTime start, LocalDateTime end);
}
