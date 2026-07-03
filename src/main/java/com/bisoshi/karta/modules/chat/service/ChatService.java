package com.bisoshi.karta.modules.chat.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.chat.dto.ChatHistoryEntry;
import com.bisoshi.karta.modules.chat.dto.ChatMessageRequest;
import com.bisoshi.karta.modules.document.model.Document;
import com.bisoshi.karta.modules.document.repository.DocumentRepository;
import com.bisoshi.karta.modules.permission.model.ProjectAccess;
import com.bisoshi.karta.modules.permission.repository.ProjectAccessRepository;
import com.bisoshi.karta.modules.project.model.Project;
import com.bisoshi.karta.modules.project.repository.ProjectRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final GeminiClient geminiClient;
    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAccessRepository projectAccessRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${gemini.model.default}")
    private String defaultModel;

    private static final String SYSTEM_PROMPT = "Eres un asistente de IA para un sistema de gestión documental. Responde en español, de manera clara y concisa, basándote únicamente en la información de los documentos proporcionados. Si la respuesta no está en los documentos, indícalo.";

    public SseEmitter chat(@NonNull UUID projectId, ChatMessageRequest request, Authentication authentication) {
        validateProjectAccess(projectId, authentication);

        SseEmitter emitter = new SseEmitter(0L);

        try {
            ArrayNode input = buildInput(request);
            geminiClient.streamInteraction(defaultModel, input,
                    text -> sendEvent(emitter, "text", text),
                    interactionId -> {
                        sendEvent(emitter, "complete", interactionId);
                        emitter.complete();
                    },
                    error -> {
                        sendEvent(emitter, "error", error.getMessage());
                        emitter.completeWithError(error);
                    });
        } catch (Exception e) {
            sendEvent(emitter, "error", e.getMessage());
            emitter.completeWithError(e);
        }

        return emitter;
    }

    private ArrayNode buildInput(ChatMessageRequest request) throws IOException, InterruptedException {
        ArrayNode input = objectMapper.createArrayNode();

        input.add(createTextNode(SYSTEM_PROMPT));

        if (request.getHistory() != null) {
            for (ChatHistoryEntry entry : request.getHistory()) {
                String label = "user".equals(entry.getRole()) ? "Usuario" : "Asistente";
                input.add(createTextNode(label + ": " + entry.getContent()));
            }
        }

        if (request.getDocumentIds() != null) {
            for (UUID documentId : request.getDocumentIds()) {
                if (documentId == null) continue;
                Document document = documentRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException(AppConstants.DOCUMENT_NOT_FOUND));

                Path filePath = Paths.get(document.getFilePathStorage());
                byte[] content = Files.readAllBytes(filePath);
                String mimeType = document.getMimeType() != null ? document.getMimeType() : "application/pdf";

                String fileUri = geminiClient.getOrUploadFile(documentId, content, mimeType, document.getName());

                ObjectNode documentNode = objectMapper.createObjectNode();
                documentNode.put("type", "document");
                documentNode.put("uri", fileUri);
                documentNode.put("mime_type", mimeType);
                input.add(documentNode);
            }
        }

        input.add(createTextNode("Usuario: " + request.getMessage()));
        input.add(createTextNode("Asistente:"));

        return input;
    }

    private ObjectNode createTextNode(String text) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("type", "text");
        node.put("text", text);
        return node;
    }

    private void validateProjectAccess(@NonNull UUID projectId, Authentication authentication) {
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

    private void sendEvent(SseEmitter emitter, String eventName, String data) {
        try {
            String safeEventName = eventName != null ? eventName : "message";
            String safeData = data != null ? data : "";
            emitter.send(SseEmitter.event().name(safeEventName).data(safeData));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }
}
