package com.bisoshi.karta.common.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtil {
    
    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public static String formatLocalDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DEFAULT_FORMATTER);
    }
    
    public static LocalDateTime parseLocalDateTime(String dateTimeString) {
        if (dateTimeString == null) {
            return null;
        }
        return LocalDateTime.parse(dateTimeString, DEFAULT_FORMATTER);
    }
    
    private DateUtil() {
    }
}
