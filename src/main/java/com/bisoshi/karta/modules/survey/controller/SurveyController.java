package com.bisoshi.karta.modules.survey.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.survey.dto.AdminSurveyAssignmentResponse;
import com.bisoshi.karta.modules.survey.dto.AssignSurveyRequest;
import com.bisoshi.karta.modules.survey.dto.CreateSurveyRequest;
import com.bisoshi.karta.modules.survey.dto.SurveyAssignmentResponse;
import com.bisoshi.karta.modules.survey.dto.SurveyResponse;
import com.bisoshi.karta.modules.survey.dto.SubmitSurveyRequest;
import com.bisoshi.karta.modules.survey.dto.UpdateSurveyRequest;
import com.bisoshi.karta.modules.survey.service.SurveyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Survey Management", description = "Endpoints for survey management")
public class SurveyController {

    private final SurveyService surveyService;

    // ------------------------------------------------------------------
    // User-facing
    // ------------------------------------------------------------------

    @GetMapping("/api/v1/surveys")
    @Operation(summary = "Get my surveys", description = "Get surveys assigned to the current user")
    public ResponseEntity<ResponseDto<List<SurveyAssignmentResponse>>> getMySurveys(Authentication authentication) {
        List<SurveyAssignmentResponse> surveys = surveyService.getMySurveys(authentication);
        return ResponseEntity.ok(ResponseDto.success("My surveys retrieved successfully", surveys));
    }

    @GetMapping("/api/v1/surveys/{assignmentId}")
    @Operation(summary = "Get a survey assignment", description = "Get a single survey assignment with the form to answer")
    public ResponseEntity<ResponseDto<SurveyAssignmentResponse>> getSurveyAssignment(
            @PathVariable @NonNull UUID assignmentId, Authentication authentication) {
        SurveyAssignmentResponse assignment = surveyService.getSurveyAssignment(assignmentId, authentication);
        return ResponseEntity.ok(ResponseDto.success("Survey retrieved successfully", assignment));
    }

    @PostMapping("/api/v1/surveys/{assignmentId}/respond")
    @Operation(summary = "Submit survey responses", description = "Submit the responses for a survey assignment")
    public ResponseEntity<ResponseDto<SurveyAssignmentResponse>> submitSurvey(
            @PathVariable @NonNull UUID assignmentId,
            @Valid @RequestBody SubmitSurveyRequest request,
            Authentication authentication) {
        SurveyAssignmentResponse assignment = surveyService.submitSurvey(assignmentId, request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.SURVEY_SUBMITTED_SUCCESSFULLY, assignment));
    }

    // ------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------

    @GetMapping("/api/v1/admin/surveys")
    @Operation(summary = "Get all surveys", description = "Get all surveys (admin only)")
    public ResponseEntity<ResponseDto<List<SurveyResponse>>> getAllSurveys() {
        List<SurveyResponse> surveys = surveyService.getAllSurveys();
        return ResponseEntity.ok(ResponseDto.success("Surveys retrieved successfully", surveys));
    }

    @GetMapping("/api/v1/admin/surveys/{surveyId}/results")
    @Operation(summary = "Get survey results", description = "Get all assignments and responses for a survey (admin only)")
    public ResponseEntity<ResponseDto<List<AdminSurveyAssignmentResponse>>> getSurveyResults(
            @PathVariable @NonNull UUID surveyId) {
        List<AdminSurveyAssignmentResponse> results = surveyService.getSurveyResults(surveyId);
        return ResponseEntity.ok(ResponseDto.success("Survey results retrieved successfully", results));
    }

    @PostMapping("/api/v1/admin/surveys")
    @Operation(summary = "Create a survey", description = "Create a new survey with a form JSON (admin only)")
    public ResponseEntity<ResponseDto<SurveyResponse>> createSurvey(
            @Valid @RequestBody CreateSurveyRequest request, Authentication authentication) {
        SurveyResponse survey = surveyService.createSurvey(request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.SURVEY_CREATED_SUCCESSFULLY, survey));
    }

    @PutMapping("/api/v1/admin/surveys/{surveyId}")
    @Operation(summary = "Update a survey", description = "Update an existing survey and its form JSON (admin only)")
    public ResponseEntity<ResponseDto<SurveyResponse>> updateSurvey(
            @PathVariable @NonNull UUID surveyId,
            @Valid @RequestBody UpdateSurveyRequest request,
            Authentication authentication) {
        SurveyResponse survey = surveyService.updateSurvey(surveyId, request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.SURVEY_UPDATED_SUCCESSFULLY, survey));
    }

    @DeleteMapping("/api/v1/admin/surveys/{surveyId}")
    @Operation(summary = "Delete a survey", description = "Delete an existing survey and all its assignments and responses (admin only)")
    public ResponseEntity<ResponseDto<Void>> deleteSurvey(
            @PathVariable @NonNull UUID surveyId,
            Authentication authentication) {
        surveyService.deleteSurvey(surveyId, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.SURVEY_DELETED_SUCCESSFULLY, null));
    }

    @PostMapping("/api/v1/admin/surveys/{surveyId}/assign")
    @Operation(summary = "Assign survey to all or selected users", description = "Assign a survey to all active users or specific user IDs (admin only)")
    public ResponseEntity<ResponseDto<Integer>> assignSurvey(
            @PathVariable @NonNull UUID surveyId,
            @RequestBody AssignSurveyRequest request,
            Authentication authentication) {
        int assigned = surveyService.assignSurvey(surveyId, request, authentication);
        return ResponseEntity.ok(ResponseDto.success("Survey assigned to " + assigned + " users", assigned));
    }

    @PostMapping("/api/v1/admin/surveys/{surveyId}/assign-all")
    @Operation(summary = "Assign survey to all users", description = "Assign a survey to all active users (admin only)")
    public ResponseEntity<ResponseDto<Integer>> assignSurveyToAllUsers(
            @PathVariable @NonNull UUID surveyId, Authentication authentication) {
        int assigned = surveyService.assignSurveyToAllUsers(surveyId, authentication);
        return ResponseEntity.ok(ResponseDto.success("Survey assigned to " + assigned + " users", assigned));
    }
}
