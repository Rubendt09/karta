package com.bisoshi.karta.common.exception;

import com.bisoshi.karta.common.dto.ResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ResponseDto<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        logger.error("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponseDto.error(ex.getMessage()));
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseDto<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        logger.error("Bad credentials: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ResponseDto.error("Invalid credentials"));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseDto<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        logger.error("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ResponseDto.error("Access denied"));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDto<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        logger.error("Validation failed: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseDto.error("Validation failed"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDto<Void>> handleGlobalException(Exception ex, HttpServletRequest request) {
        // Excluir rutas de Swagger del manejo global de excepciones
        String requestUri = request.getRequestURI();
        if (requestUri.contains("/swagger-ui") || requestUri.contains("/v3/api-docs")) {
            throw new RuntimeException(ex);
        }
        logger.error("Unexpected error at {}: {}", requestUri, ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseDto.error("An unexpected error occurred: " + ex.getMessage()));
    }
}
