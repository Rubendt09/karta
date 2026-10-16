package com.bisoshi.karta.modules.survey.repository;

import com.bisoshi.karta.modules.survey.model.Survey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SurveyRepository extends JpaRepository<Survey, UUID> {

    List<Survey> findByActiveTrue();
}
