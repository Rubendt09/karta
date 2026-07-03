package com.bisoshi.karta.modules.chat.controller;

import com.bisoshi.karta.modules.chat.dto.ChatMessageRequest;
import com.bisoshi.karta.modules.chat.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/chat")
@RequiredArgsConstructor
@Tag(name = "Project Chat", description = "AI assistant chat with project documents")
public class ChatController {

    private final ChatService chatService;

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Chat with project documents", description = "Send a message to the AI assistant and receive a streaming response based on selected documents")
    public SseEmitter chat(
            @PathVariable @NonNull UUID projectId,
            @RequestBody ChatMessageRequest request,
            Authentication authentication) {
        return chatService.chat(projectId, request, authentication);
    }
}
