package com.ramonnnarokomo.jobtracker.web.dto;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(
        @NotNull(message = "El estado es obligatorio.")
        ApplicationStatus status) {
}
