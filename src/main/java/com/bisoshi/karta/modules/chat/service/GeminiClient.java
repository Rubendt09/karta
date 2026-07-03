package com.bisoshi.karta.modules.chat.service;

import com.bisoshi.karta.modules.chat.model.CachedGeminiFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    @Value("${gemini.model.default}")
    private String defaultModel;

    private HttpClient httpClient;
    private final Map<UUID, CachedGeminiFile> fileCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    public String getOrUploadFile(UUID documentId, byte[] fileContent, String mimeType, String displayName) throws IOException, InterruptedException {
        CachedGeminiFile cached = fileCache.get(documentId);
        if (cached != null && cached.getExpirationTime().isAfter(Instant.now())) {
            return cached.getUri();
        }

        String uri = uploadFile(fileContent, mimeType, displayName);
        Instant expiration = Instant.now().plusSeconds(TimeUnit.HOURS.toSeconds(48));
        fileCache.put(documentId, new CachedGeminiFile(uri, expiration));
        return uri;
    }

    public String uploadFile(byte[] fileContent, String mimeType, String displayName) throws IOException, InterruptedException {
        String startUrl = baseUrl + "/upload/v1beta/files?key=" + apiKey;

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.putObject("file").put("display_name", displayName);

        HttpRequest startRequest = HttpRequest.newBuilder()
                .uri(URI.create(startUrl))
                .header("X-Goog-Upload-Protocol", "resumable")
                .header("X-Goog-Upload-Command", "start")
                .header("X-Goog-Upload-Header-Content-Length", String.valueOf(fileContent.length))
                .header("X-Goog-Upload-Header-Content-Type", mimeType)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(metadata.toString(), StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> startResponse = httpClient.send(startRequest, HttpResponse.BodyHandlers.ofString());

        if (startResponse.statusCode() >= 400) {
            throw new IOException("Failed to initiate Gemini file upload: " + startResponse.body());
        }

        String uploadUrl = startResponse.headers().firstValue("x-goog-upload-url")
                .orElseThrow(() -> new IOException("Upload URL not found in response headers"));

        HttpRequest uploadRequest = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("X-Goog-Upload-Offset", "0")
                .header("X-Goog-Upload-Command", "upload, finalize")
                .POST(HttpRequest.BodyPublishers.ofByteArray(fileContent))
                .build();

        HttpResponse<String> uploadResponse = httpClient.send(uploadRequest, HttpResponse.BodyHandlers.ofString());

        if (uploadResponse.statusCode() >= 400) {
            throw new IOException("Failed to upload file to Gemini: " + uploadResponse.body());
        }

        JsonNode fileInfo = objectMapper.readTree(uploadResponse.body());
        return fileInfo.path("file").path("uri").asText();
    }

    public void streamInteraction(String model, ArrayNode input, Consumer<String> onTextDelta, Consumer<String> onComplete, Consumer<Throwable> onError) {
        String interactionsUrl = baseUrl + "/v1beta/interactions?alt=sse";

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("input", input);
        payload.put("stream", true);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(interactionsUrl))
                .header("x-goog-api-key", apiKey)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofMinutes(5))
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString(), StandardCharsets.UTF_8))
                .build();

        httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofLines())
                .thenAccept(response -> {
                    if (response.statusCode() >= 400) {
                        String body = response.body().findFirst().orElse("");
                        onError.accept(new IOException("Gemini API error " + response.statusCode() + ": " + body));
                        return;
                    }

                    response.body().forEach(line -> processSseLine(line, onTextDelta, onComplete, onError));
                })
                .exceptionally(throwable -> {
                    onError.accept(throwable);
                    return null;
                });
    }

    private void processSseLine(String line, Consumer<String> onTextDelta, Consumer<String> onComplete, Consumer<Throwable> onError) {
        if (line == null || line.isEmpty()) return;
        if (!line.startsWith("data: ")) return;

        String data = line.substring(6).trim();
        if (data.isEmpty()) return;

        try {
            JsonNode event = objectMapper.readTree(data);
            String eventType = event.path("event_type").asText();

            if ("interaction.completed".equals(eventType)) {
                String interactionId = event.path("interaction").path("id").asText();
                onComplete.accept(interactionId);
                return;
            }

            if ("step.delta".equals(eventType)) {
                JsonNode delta = event.path("delta");
                String deltaType = delta.path("type").asText();
                if ("text".equals(deltaType)) {
                    String text = delta.path("text").asText();
                    if (!text.isEmpty()) {
                        onTextDelta.accept(text);
                    }
                }
            }
        } catch (IOException e) {
            log.warn("Failed to parse SSE event: {}", line, e);
        }
    }
}
