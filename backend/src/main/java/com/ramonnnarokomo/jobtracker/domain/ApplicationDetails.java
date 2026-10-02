package com.ramonnnarokomo.jobtracker.domain;

import java.time.LocalDate;

/**
 * The editable data of an application, everything except its status.
 * Text fields are trimmed and blank values become {@code null}, so an empty
 * form field is never stored as an empty string.
 */
public record ApplicationDetails(
        String company,
        String position,
        String location,
        WorkMode workMode,
        String source,
        String jobUrl,
        Integer salaryMinK,
        Integer salaryMaxK,
        LocalDate appliedAt,
        String notes) {

    public ApplicationDetails {
        company = clean(company);
        position = clean(position);
        location = clean(location);
        source = clean(source);
        jobUrl = clean(jobUrl);
        notes = clean(notes);
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
