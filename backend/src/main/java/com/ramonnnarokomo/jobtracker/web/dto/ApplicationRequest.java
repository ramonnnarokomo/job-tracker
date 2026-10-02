package com.ramonnnarokomo.jobtracker.web.dto;

import com.ramonnnarokomo.jobtracker.domain.ApplicationDetails;
import com.ramonnnarokomo.jobtracker.domain.ApplicationStatus;
import com.ramonnnarokomo.jobtracker.domain.WorkMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;

/**
 * Body of POST and PUT /api/applications.
 * {@code status} is only read on creation (WISHLIST by default); on PUT it is ignored,
 * because status changes go through PATCH /status so the transitions are always checked.
 */
public record ApplicationRequest(
        @NotBlank(message = "La empresa es obligatoria.")
        @Size(max = 100, message = "La empresa no puede superar los 100 caracteres.")
        String company,

        @NotBlank(message = "El puesto es obligatorio.")
        @Size(max = 100, message = "El puesto no puede superar los 100 caracteres.")
        String position,

        @Size(max = 100, message = "La ubicación no puede superar los 100 caracteres.")
        String location,

        @NotNull(message = "La modalidad es obligatoria.")
        WorkMode workMode,

        @Size(max = 60, message = "La fuente no puede superar los 60 caracteres.")
        String source,

        @URL(message = "La URL de la oferta no es válida.")
        @Size(max = 500, message = "La URL no puede superar los 500 caracteres.")
        String jobUrl,

        @PositiveOrZero(message = "El salario mínimo no puede ser negativo.")
        Integer salaryMinK,

        @PositiveOrZero(message = "El salario máximo no puede ser negativo.")
        Integer salaryMaxK,

        ApplicationStatus status,

        LocalDate appliedAt,

        @Size(max = 2000, message = "Las notas no pueden superar los 2000 caracteres.")
        String notes) {

    public ApplicationDetails toDetails() {
        return new ApplicationDetails(company, position, location, workMode, source, jobUrl,
                salaryMinK, salaryMaxK, appliedAt, notes);
    }

    public ApplicationStatus statusOrDefault() {
        return status != null ? status : ApplicationStatus.WISHLIST;
    }
}
