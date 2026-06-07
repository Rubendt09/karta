package com.bisoshi.karta.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDto<T> {
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private boolean success;
    
    public static <T> ResponseDto<T> success(String message, T data) {
        return new ResponseDto<>(message, data, LocalDateTime.now(), true);
    }
    
    public static <T> ResponseDto<T> success(String message) {
        return new ResponseDto<>(message, null, LocalDateTime.now(), true);
    }
    
    public static <T> ResponseDto<T> error(String message) {
        return new ResponseDto<>(message, null, LocalDateTime.now(), false);
    }
}
