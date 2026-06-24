package com.bisoshi.karta.modules.audit.service;

import com.bisoshi.karta.modules.audit.dto.ActivityLogFilter;
import com.bisoshi.karta.modules.audit.dto.ActivityLogRequest;
import com.bisoshi.karta.modules.audit.dto.ActivityLogResponse;
import com.bisoshi.karta.modules.audit.model.ActivityLog;
import com.bisoshi.karta.modules.audit.repository.ActivityLogRepository;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public void log(ActivityLogRequest request) {
        ActivityLog log = new ActivityLog();
        log.setUserId(request.getUserId());
        log.setUserEmail(request.getUserEmail());
        log.setAction(request.getAction());
        log.setModule(request.getModule());
        log.setEntityId(request.getEntityId());
        log.setEntityName(request.getEntityName());
        log.setDescription(request.getDescription());

        HttpServletRequest httpRequest = getCurrentHttpRequest();
        if (httpRequest != null) {
            log.setIpAddress(getClientIpAddress(httpRequest));
            log.setUserAgent(httpRequest.getHeader("User-Agent"));
        }

        activityLogRepository.save(log);
    }

    public void logCurrentUser(String action, String module, UUID entityId, String entityName, String description) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = null;
        String userEmail = null;

        if (authentication != null && authentication.isAuthenticated()) {
            userEmail = authentication.getName();
            userId = userRepository.findByEmail(userEmail)
                    .map(User::getId)
                    .orElse(null);
        }

        log(ActivityLogRequest.builder()
                .userId(userId)
                .userEmail(userEmail)
                .action(action)
                .module(module)
                .entityId(entityId)
                .entityName(entityName)
                .description(description)
                .build());
    }

    public List<ActivityLogResponse> getActivityLogs(ActivityLogFilter filter) {
        List<ActivityLog> logs;

        UUID userId = filter.getUserId();
        String module = filter.getModule();
        String action = filter.getAction();
        LocalDateTime start = filter.getStartDate();
        LocalDateTime end = filter.getEndDate();

        boolean hasUserId = userId != null;
        boolean hasModule = module != null && !module.isBlank();
        boolean hasAction = action != null && !action.isBlank();
        boolean hasDates = start != null && end != null;

        if (hasUserId && hasModule && hasAction && hasDates) {
            logs = activityLogRepository.findByUserIdAndModuleAndActionAndTimestampBetweenOrderByTimestampDesc(
                    userId, module, action, start, end);
        } else if (hasModule && hasAction && hasDates) {
            logs = activityLogRepository.findByModuleAndActionAndTimestampBetweenOrderByTimestampDesc(
                    module, action, start, end);
        } else if (hasUserId && hasAction && hasDates) {
            logs = activityLogRepository.findByUserIdAndActionAndTimestampBetweenOrderByTimestampDesc(
                    userId, action, start, end);
        } else if (hasUserId && hasModule && hasDates) {
            logs = activityLogRepository.findByUserIdAndModuleAndTimestampBetweenOrderByTimestampDesc(
                    userId, module, start, end);
        } else if (hasUserId && hasDates) {
            logs = activityLogRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, start, end);
        } else if (hasModule && hasDates) {
            logs = activityLogRepository.findByModuleAndTimestampBetweenOrderByTimestampDesc(module, start, end);
        } else if (hasAction && hasDates) {
            logs = activityLogRepository.findByActionAndTimestampBetweenOrderByTimestampDesc(action, start, end);
        } else if (hasDates) {
            logs = activityLogRepository.findByTimestampBetweenOrderByTimestampDesc(start, end);
        } else if (hasUserId) {
            logs = activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
        } else if (hasModule) {
            logs = activityLogRepository.findByModuleOrderByTimestampDesc(module);
        } else if (hasAction) {
            logs = activityLogRepository.findByActionOrderByTimestampDesc(action);
        } else {
            logs = activityLogRepository.findAllByOrderByTimestampDesc();
        }

        return logs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ActivityLogResponse mapToResponse(ActivityLog log) {
        return new ActivityLogResponse(
                log.getId(),
                log.getTimestamp(),
                log.getUserId(),
                log.getUserEmail(),
                log.getAction(),
                log.getModule(),
                log.getEntityId(),
                log.getEntityName(),
                log.getDescription(),
                log.getIpAddress(),
                log.getUserAgent()
        );
    }

    private HttpServletRequest getCurrentHttpRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "X-Real-IP",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP"
        };

        for (String header : headers) {
            String value = request.getHeader(header);
            if (value != null && !value.isBlank() && !"unknown".equalsIgnoreCase(value)) {
                return value.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }
}
