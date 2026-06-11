package com.bisoshi.karta.modules.document.controller;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.document.dto.DocumentResponse;
import com.bisoshi.karta.modules.document.dto.UpdateDocumentRequest;
import com.bisoshi.karta.modules.document.dto.UploadDocumentRequest;
import com.bisoshi.karta.modules.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/documents")
@RequiredArgsConstructor
@Tag(name = "Document Management", description = "Endpoints for document management")
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @Operation(summary = "Get all documents for a project", description = "Get all documents for a project")
    public ResponseEntity<ResponseDto<List<DocumentResponse>>> getProjectDocuments(
            @PathVariable @NonNull UUID projectId, Authentication authentication) {
        List<DocumentResponse> documents = documentService.getProjectDocuments(projectId, authentication);
        return ResponseEntity.ok(ResponseDto.success("Documents retrieved successfully", documents));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document by ID", description = "Get document by ID")
    public ResponseEntity<ResponseDto<DocumentResponse>> getDocumentById(@PathVariable @NonNull UUID projectId,
            @PathVariable @NonNull UUID id, Authentication authentication) {
        DocumentResponse document = documentService.getDocumentById(id, authentication);
        return ResponseEntity.ok(ResponseDto.success("Document retrieved successfully", document));
    }

    @PostMapping
    @Operation(summary = "Upload a document to a project", description = "Upload a document to a project")
    public ResponseEntity<ResponseDto<DocumentResponse>> uploadDocument(
            @PathVariable @NonNull UUID projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) {

        UploadDocumentRequest request = new UploadDocumentRequest();
        request.setName(name);
        request.setDescription(description);
        if (priority != null) {
            request.setPriority(com.bisoshi.karta.modules.document.model.Priority.valueOf(priority));
        }

        DocumentResponse document = documentService.uploadDocument(projectId, request, file, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.DOCUMENT_UPLOADED_SUCCESSFULLY, document));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update document metadata", description = "Update document metadata")
    public ResponseEntity<ResponseDto<DocumentResponse>> updateDocument(
            @PathVariable @NonNull UUID projectId,
            @PathVariable @NonNull UUID id,
            @Valid @RequestBody UpdateDocumentRequest request,
            Authentication authentication) {
        DocumentResponse document = documentService.updateDocument(id, request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.DOCUMENT_UPDATED_SUCCESSFULLY, document));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download document", description = "Download document file")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable @NonNull UUID projectId,
            @PathVariable @NonNull UUID id, Authentication authentication) {
        byte[] fileContent = documentService.downloadDocument(id, authentication);
        DocumentResponse document = documentService.getDocumentById(id, authentication);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + document.getName() + "\"")
                .header("Content-Type", document.getMimeType())
                .body(fileContent);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document", description = "Delete a document")
    public ResponseEntity<ResponseDto<Void>> deleteDocument(@PathVariable @NonNull UUID projectId,
            @PathVariable @NonNull UUID id, Authentication authentication) {
        documentService.deleteDocument(id, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.DOCUMENT_DELETED_SUCCESSFULLY));
    }
}
