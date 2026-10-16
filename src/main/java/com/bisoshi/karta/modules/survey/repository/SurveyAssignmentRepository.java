package com.bisoshi.karta.modules.survey.repository;

import com.bisoshi.karta.modules.survey.model.SurveyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SurveyAssignmentRepository extends JpaRepository<SurveyAssignment, UUID> {

    List<SurveyAssignment> findByUserId(UUID userId);

    Optional<SurveyAssignment> findByUserIdAndSurveyId(UUID userId, UUID surveyId);

    List<SurveyAssignment> findBySurveyId(UUID surveyId);
}
