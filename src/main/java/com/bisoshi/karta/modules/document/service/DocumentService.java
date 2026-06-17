package com.bisoshi.karta.modules.document.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.document.dto.DocumentResponse;
import com.bisoshi.karta.modules.document.dto.UpdateDocumentRequest;
import com.bisoshi.karta.modules.document.dto.UploadDocumentRequest;
import com.bisoshi.karta.modules.document.model.Document;
import com.bisoshi.karta.modules.document.model.Priority;
import com.bisoshi.karta.modules.document.repository.DocumentRepository;
import com.bisoshi.karta.modules.permission.model.ProjectAccess;
import com.bisoshi.karta.modules.permission.repository.ProjectAccessRepository;
import com.bisoshi.karta.modules.project.model.Project;
import com.bisoshi.karta.modules.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAccessRepository projectAccessRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<DocumentResponse> getProjectDocuments(@NonNull UUID projectId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            ProjectAccess access = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED));

            if (!access.getCanView()) {
                throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
            }
        }

        return documentRepository.findByProjectId(projectId).stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    public DocumentResponse getDocumentById(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.DOCUMENT_NOT_FOUND));

        Project project = projectRepository.findById(document.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            ProjectAccess access = projectAccessRepository.findByProjectIdAndUserId(document.getProjectId(), userId)
                    .orElseThrow(() -> new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED));

            if (!access.getCanView()) {
                throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
            }
        }

        return mapToDocumentResponse(document);
    }

    public DocumentResponse uploadDocument(@NonNull UUID projectId, UploadDocumentRequest request, MultipartFile file,
            Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            ProjectAccess access = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED));

            if (!access.getCanEdit()) {
                throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
            }
        }

        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            Document document = new Document();
            document.setProjectId(projectId);
            document.setName(request.getName());
            document.setDescription(request.getDescription());
            document.setFilePathStorage(filePath.toString());
            document.setFileSize(file.getSize());
            document.setMimeType(file.getContentType());
            document.setUploadedBy(userId);
            document.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIA);

            document = documentRepository.save(document);

            return mapToDocumentResponse(document);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @SuppressWarnings("null")
    public DocumentResponse updateDocument(@NonNull UUID id, UpdateDocumentRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.DOCUMENT_NOT_FOUND));

        Project project = projectRepository.findById(document.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            ProjectAccess access = projectAccessRepository.findByProjectIdAndUserId(document.getProjectId(), userId)
                    .orElseThrow(() -> new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED));

            if (!access.getCanEdit()) {
                throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
            }
        }

        document.setName(request.getName());
        if (request.getPriority() != null) {
            document.setPriority(request.getPriority());
        }
        if (request.getDescription() != null) {
            document.setDescription(request.getDescription());
        }

        document = documentRepository.save(document);

        return mapToDocumentResponse(document);
    }

    @SuppressWarnings("null")
    public void deleteDocument(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.DOCUMENT_NOT_FOUND));

        Project project = projectRepository.findById(document.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            ProjectAccess access = projectAccessRepository.findByProjectIdAndUserId(document.getProjectId(), userId)
                    .orElseThrow(() -> new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED));

            if (!access.getCanDelete()) {
                throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
            }
        }

        try {
            Path filePath = Paths.get(document.getFilePathStorage());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }

        documentRepository.delete(document);
    }

    @SuppressWarnings("null")
    public byte[] downloadDocument(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.DOCUMENT_NOT_FOUND));

        Project project = projectRepository.findById(document.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            ProjectAccess access = projectAccessRepository.findByProjectIdAndUserId(document.getProjectId(), userId)
                    .orElseThrow(() -> new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED));

            if (!access.getCanView()) {
                throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
            }
        }

        try {
            Path filePath = Paths.get(document.getFilePathStorage());
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        return user.getId();
    }

    private Role getRoleFromAuthentication(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> {
                    String roleName = authority.getAuthority();
                    if (roleName.startsWith("ROLE_")) {
                        return Role.valueOf(roleName.substring(5));
                    }
                    return Role.valueOf(roleName);
                })
                .orElse(Role.INVITADO);
    }

    private DocumentResponse mapToDocumentResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getProjectId(),
                document.getName(),
                document.getDescription(),
                document.getFileSize(),
                document.getMimeType(),
                document.getUploadedBy(),
                document.getCreatedAt(),
                document.getPriority());
    }
}
