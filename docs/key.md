Gemini api Key: 

YOUR_GEMINI_API_KEY

modelos disponibles:

- gemini-3.1-flash-lite
- gemini-3.1-flash
- gemini-3.1-pro


curl y respuesta de prueba:

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
  -H "x-goog-api-key: YOUR_GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gemini-3.1-flash-lite",
    "input": "Explain how AI works in a few words"
  }'
```
```json
    {
  "id": "v1_Chd6cG85YXZQeUJjWFZ6N0lQbDVxQS1RZxIXenBvOWF2UHlCY1hWejdJUGw1cUEtUWc",
  "status": "completed",
  "usage": {
    "total_tokens": 31,
    "total_input_tokens": 9,
    "input_tokens_by_modality": [
      {
        "modality": "text",
        "tokens": 9
      }
    ],
    "total_cached_tokens": 0,
    "total_output_tokens": 22,
    "total_tool_use_tokens": 0,
    "total_thought_tokens": 0
  },
  "created": "2026-06-25T21:17:02Z",
  "updated": "2026-06-25T21:17:02Z",
  "service_tier": "standard",
  "steps": [
    {
      "signature": "EjQKMgEMOdbHJL38ITq/xo58JkWbYYcGI9JNEiflXyAemyMfNvCeHjDokaik14oyGyJGT83L",
      "type": "thought"
    },
    {
      "content": [
        {
          "text": "AI works by finding **patterns** in massive amounts of **data** to make **predictions** or decisions.",
          "type": "text"
        }
      ],
      "type": "model_output"
    }
  ],
  "object": "interaction",
  "model": "gemini-3.1-flash-lite"
}
```

pagina de guia apar el manejo de documentos:

https://ai.google.dev/gemini-api/docs/document-processing?hl=es-419
