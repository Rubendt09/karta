package com.bisoshi.karta.modules.chat.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ChatMessageRequest {
    private String message;
    private List<UUID> documentIds;
    private List<ChatHistoryEntry> history;
}
