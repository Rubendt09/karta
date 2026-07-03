package com.bisoshi.karta.modules.chat.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class CachedGeminiFile {
    private String uri;
    private Instant expirationTime;
}
