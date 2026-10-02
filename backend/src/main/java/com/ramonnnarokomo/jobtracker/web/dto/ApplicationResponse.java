package com.ramonnnarokomo.jobtracker.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ramonnnarokomo.jobtracker.domain.ApplicationStatus;
import com.ramonnnarokomo.jobtracker.domain.JobApplication;
import com.ramonnnarokomo.jobtracker.domain.WorkMode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * An application as the frontend sees it. {@code daysSinceUpdate} and {@code followUpDue}
 * depend on today's date, so they are computed when the response is built.
 * {@code history} is only filled (and only serialized) in GET /api/applications/{id}.
 */
public record ApplicationResponse(
        Long id,
        String company,
        String position,
        String location,
        WorkMode workMode,
        String source,
        String jobUrl,
        Integer salaryMinK,
        Integer salaryMaxK,
        ApplicationStatus status,
        LocalDate appliedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String notes,
        long daysSinceUpdate,
        boolean followUpDue,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        List<StatusChangeResponse> history) {

    /** Card view, without history: used by the list and by the write endpoints. */
    public static ApplicationResponse from(JobApplication application, LocalDate today) {
        return build(application, today, null);
    }

    /** Detail view, with the status history (oldest first). */
    public static ApplicationResponse withHistory(JobApplication application, LocalDate today) {
        List<StatusChangeResponse> history = application.getHistory().stream()
                .map(StatusChangeResponse::from)
                .toList();
        return build(application, today, history);
    }

    private static ApplicationResponse build(JobApplication application, LocalDate today,
                                             List<StatusChangeResponse> history) {
        return new ApplicationResponse(
                application.getId(),
                application.getCompany(),
                application.getPosition(),
                application.getLocation(),
                application.getWorkMode(),
                application.getSource(),
                application.getJobUrl(),
                application.getSalaryMinK(),
                application.getSalaryMaxK(),
                application.getStatus(),
                application.getAppliedAt(),
                application.getCreatedAt(),
                application.getUpdatedAt(),
                application.getNotes(),
                application.daysSinceUpdate(today),
                application.isFollowUpDue(today),
                history);
    }
}
