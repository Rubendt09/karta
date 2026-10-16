package com.bisoshi.karta.modules.survey.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.audit.dto.ActivityLogRequest;
import com.bisoshi.karta.modules.audit.service.ActivityLogService;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.survey.dto.AdminSurveyAssignmentResponse;
import com.bisoshi.karta.modules.survey.dto.AssignSurveyRequest;
import com.bisoshi.karta.modules.survey.dto.CreateSurveyRequest;
import com.bisoshi.karta.modules.survey.dto.SurveyAssignmentResponse;
import com.bisoshi.karta.modules.survey.dto.SurveyResponse;
import com.bisoshi.karta.modules.survey.dto.SubmitSurveyRequest;
import com.bisoshi.karta.modules.survey.dto.UpdateSurveyRequest;
import com.bisoshi.karta.modules.survey.model.Survey;
import com.bisoshi.karta.modules.survey.model.SurveyAssignment;
import com.bisoshi.karta.modules.survey.model.SurveyStatus;
import com.bisoshi.karta.modules.survey.repository.SurveyAssignmentRepository;
import com.bisoshi.karta.modules.survey.repository.SurveyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final SurveyAssignmentRepository surveyAssignmentRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    // ------------------------------------------------------------------
    // User-facing
    // ------------------------------------------------------------------

    public List<SurveyAssignmentResponse> getMySurveys(Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        return surveyAssignmentRepository.findByUserId(userId).stream()
                .map(assignment -> mapToAssignmentResponse(assignment, assignment.getSurveyId()))
                .collect(Collectors.toList());
    }

    public SurveyAssignmentResponse getSurveyAssignment(@NonNull UUID assignmentId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        SurveyAssignment assignment = surveyAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.SURVEY_NOT_FOUND));

        if (!assignment.getUserId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.ACCESS_DENIED);
        }

        return mapToAssignmentResponse(assignment, assignment.getSurveyId());
    }

    public SurveyAssignmentResponse submitSurvey(@NonNull UUID assignmentId, SubmitSurveyRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        SurveyAssignment assignment = surveyAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.SURVEY_NOT_FOUND));

        if (!assignment.getUserId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.ACCESS_DENIED);
        }

        if (assignment.getStatus() == SurveyStatus.COMPLETADA) {
            throw new IllegalArgumentException(AppConstants.SURVEY_ALREADY_COMPLETED);
        }

        assignment.setResponseJson(request.getResponseJson());
        assignment.setStatus(SurveyStatus.COMPLETADA);
        assignment.setCompletedAt(LocalDateTime.now());
        surveyAssignmentRepository.save(assignment);

        @SuppressWarnings("null")
        Survey survey = surveyRepository.findById(assignment.getSurveyId()).orElse(null);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(userId)
                .userEmail(authentication.getName())
                .action("SUBMIT_SURVEY")
                .module("SURVEY")
                .entityId(assignment.getId())
                .entityName(survey != null ? survey.getName() : assignment.getSurveyId().toString())
                .description("Respondió la encuesta '" + (survey != null ? survey.getName() : "") + "'")
                .build());

        return mapToAssignmentResponse(assignment, assignment.getSurveyId());
    }

    // ------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------

    public SurveyResponse createSurvey(CreateSurveyRequest request, Authentication authentication) {
        Survey survey = new Survey();
        survey.setName(request.getName());
        survey.setDescription(request.getDescription());
        survey.setFormJson(request.getFormJson());
        survey.setActive(true);

        survey = surveyRepository.save(survey);

        UUID userId = getUserIdFromAuthentication(authentication);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(userId)
                .userEmail(authentication.getName())
                .action("CREATE_SURVEY")
                .module("SURVEY")
                .entityId(survey.getId())
                .entityName(survey.getName())
                .description("Creó la encuesta '" + survey.getName() + "'")
                .build());

        return mapToSurveyResponse(survey);
    }

    public SurveyResponse updateSurvey(@NonNull UUID surveyId, UpdateSurveyRequest request,
            Authentication authentication) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.SURVEY_NOT_FOUND));

        survey.setName(request.getName());
        survey.setDescription(request.getDescription());
        survey.setFormJson(request.getFormJson());
        if (request.getActive() != null) {
            survey.setActive(request.getActive());
        }

        survey = surveyRepository.save(survey);

        UUID userId = getUserIdFromAuthentication(authentication);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(userId)
                .userEmail(authentication.getName())
                .action("UPDATE")
                .module("SURVEY")
                .entityId(survey.getId())
                .entityName(survey.getName())
                .description("Actualizó la encuesta '" + survey.getName() + "'")
                .build());

        return mapToSurveyResponse(survey);
    }

    @Transactional
    public void deleteSurvey(@NonNull UUID surveyId, Authentication authentication) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.SURVEY_NOT_FOUND));

        List<SurveyAssignment> assignments = surveyAssignmentRepository.findBySurveyId(surveyId);
        int totalRemovedAssignments = assignments.size();
        if (!assignments.isEmpty()) {
            surveyAssignmentRepository.deleteAll(assignments);
        }

        String surveyName = survey.getName();
        surveyRepository.delete(survey);

        UUID userId = getUserIdFromAuthentication(authentication);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(userId)
                .userEmail(authentication.getName())
                .action("DELETE")
                .module("SURVEY")
                .entityId(surveyId)
                .entityName(surveyName)
                .description("Eliminó la encuesta '" + surveyName + "' junto con " + totalRemovedAssignments + " asignaciones/resultados")
                .build());
    }

    public int assignSurvey(@NonNull UUID surveyId, AssignSurveyRequest request, Authentication authentication) {
        if (Boolean.TRUE.equals(request.getAssignToAll())) {
            return assignSurveyToAllUsers(surveyId, authentication);
        }

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.SURVEY_NOT_FOUND));

        List<UUID> targetUserIds = request.getUserIds() != null ? request.getUserIds() : java.util.Collections.emptyList();
        java.util.Set<UUID> targetSet = targetUserIds.stream()
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        // Remove assignments for users that were unselected
        List<SurveyAssignment> existingAssignments = surveyAssignmentRepository.findBySurveyId(surveyId);
        int removed = 0;
        for (SurveyAssignment existing : existingAssignments) {
            if (!targetSet.contains(existing.getUserId())) {
                surveyAssignmentRepository.delete(existing);
                removed++;
            }
        }

        // Create assignments for newly selected users
        int created = 0;
        for (UUID targetUserId : targetSet) {
            if (targetUserId == null) {
                continue;
            }
            User user = userRepository.findById(targetUserId).orElse(null);
            if (user == null || !Boolean.TRUE.equals(user.getActive())) {
                continue;
            }
            if (surveyAssignmentRepository.findByUserIdAndSurveyId(user.getId(), surveyId).isPresent()) {
                continue;
            }

            SurveyAssignment assignment = new SurveyAssignment();
            assignment.setSurveyId(surveyId);
            assignment.setUserId(user.getId());
            assignment.setStatus(SurveyStatus.PENDIENTE);
            surveyAssignmentRepository.save(assignment);
            created++;
        }

        UUID adminId = getUserIdFromAuthentication(authentication);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(adminId)
                .userEmail(authentication.getName())
                .action("ASSIGN_SURVEY")
                .module("SURVEY")
                .entityId(survey.getId())
                .entityName(survey.getName())
                .description("Actualizó asignaciones de la encuesta '" + survey.getName() + "' (+" + created + " asignados, -" + removed + " desasignados)")
                .build());

        return created;
    }

    public int assignSurveyToAllUsers(@NonNull UUID surveyId, Authentication authentication) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.SURVEY_NOT_FOUND));

        List<User> activeUsers = userRepository.findAll().stream()
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .collect(Collectors.toList());

        int created = 0;
        for (User user : activeUsers) {
            // Skip if already assigned
            if (surveyAssignmentRepository.findByUserIdAndSurveyId(user.getId(), surveyId).isPresent()) {
                continue;
            }

            SurveyAssignment assignment = new SurveyAssignment();
            assignment.setSurveyId(surveyId);
            assignment.setUserId(user.getId());
            assignment.setStatus(SurveyStatus.PENDIENTE);
            surveyAssignmentRepository.save(assignment);
            created++;
        }

        UUID userId = getUserIdFromAuthentication(authentication);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(userId)
                .userEmail(authentication.getName())
                .action("ASSIGN_SURVEY")
                .module("SURVEY")
                .entityId(survey.getId())
                .entityName(survey.getName())
                .description("Asignó la encuesta '" + survey.getName() + "' a " + created + " usuarios")
                .build());

        return created;
    }

    public List<SurveyResponse> getAllSurveys() {
        return surveyRepository.findAll().stream()
                .map(this::mapToSurveyResponse)
                .collect(Collectors.toList());
    }

    public List<AdminSurveyAssignmentResponse> getSurveyResults(@NonNull UUID surveyId) {
        if (!surveyRepository.existsById(surveyId)) {
            throw new ResourceNotFoundException(AppConstants.SURVEY_NOT_FOUND);
        }

        List<SurveyAssignment> assignments = surveyAssignmentRepository.findBySurveyId(surveyId);
        return assignments.stream()
                .map(assignment -> {
                    @SuppressWarnings("null")
                    User user = userRepository.findById(assignment.getUserId()).orElse(null);
                    return new AdminSurveyAssignmentResponse(
                            assignment.getId(),
                            assignment.getSurveyId(),
                            assignment.getUserId(),
                            user != null ? user.getName() : "Usuario desconocido",
                            user != null ? user.getEmail() : "-",
                            user != null && user.getRole() != null ? user.getRole().name() : "-",
                            assignment.getStatus(),
                            assignment.getAssignedAt(),
                            assignment.getCompletedAt(),
                            assignment.getResponseJson());
                })
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        return user.getId();
    }

    private SurveyAssignmentResponse mapToAssignmentResponse(SurveyAssignment assignment, UUID surveyId) {
        @SuppressWarnings("null")
        Survey survey = surveyRepository.findById(surveyId).orElse(null);
        return new SurveyAssignmentResponse(
                assignment.getId(),
                assignment.getSurveyId(),
                survey != null ? survey.getName() : null,
                survey != null ? survey.getDescription() : null,
                assignment.getStatus(),
                assignment.getAssignedAt(),
                assignment.getCompletedAt(),
                survey != null ? survey.getFormJson() : null,
                assignment.getResponseJson());
    }

    private SurveyResponse mapToSurveyResponse(Survey survey) {
        List<SurveyAssignment> assignments = surveyAssignmentRepository.findBySurveyId(survey.getId());
        long totalAssigned = assignments.size();
        long completedCount = assignments.stream()
                .filter(a -> a.getStatus() == SurveyStatus.COMPLETADA)
                .count();
        long pendingCount = assignments.stream()
                .filter(a -> a.getStatus() == SurveyStatus.PENDIENTE)
                .count();

        return new SurveyResponse(
                survey.getId(),
                survey.getName(),
                survey.getDescription(),
                survey.getFormJson(),
                survey.getActive(),
                survey.getCreatedAt(),
                totalAssigned,
                completedCount,
                pendingCount);
    }
}
