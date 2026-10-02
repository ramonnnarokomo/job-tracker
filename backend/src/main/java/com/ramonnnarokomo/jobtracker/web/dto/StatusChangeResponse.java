package com.ramonnnarokomo.jobtracker.web.dto;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStatus;
import com.ramonnnarokomo.jobtracker.domain.StatusChange;

import java.time.LocalDateTime;

public record StatusChangeResponse(
        ApplicationStatus fromStatus,
        ApplicationStatus toStatus,
        LocalDateTime changedAt) {

    public static StatusChangeResponse from(StatusChange change) {
        return new StatusChangeResponse(change.getFromStatus(), change.getToStatus(), change.getChangedAt());
    }
}
