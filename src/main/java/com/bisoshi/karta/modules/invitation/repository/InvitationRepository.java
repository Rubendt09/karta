package com.bisoshi.karta.modules.invitation.repository;

import com.bisoshi.karta.modules.invitation.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Optional<Invitation> findByEmail(String email);

    List<Invitation> findByProjectId(UUID projectId);

    List<Invitation> findByInvitedBy(UUID invitedBy);

    Optional<Invitation> findByEmailAndProjectId(String email, UUID projectId);
}
