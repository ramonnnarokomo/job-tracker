package com.ramonnnarokomo.jobtracker.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Numbers for the stats page. Serialized as-is by the API.
 *
 * @param interviewRate share of sent applications that reached an interview, rounded to
 *                      2 decimals; {@code null} when nothing has been sent yet
 * @param weekly        applications sent per week (Monday start), last 8 weeks, oldest first
 */
public record ApplicationStats(
        long total,
        Map<ApplicationStatus, Long> byStatus,
        long active,
        Double interviewRate,
        long followUpDue,
        List<WeeklyCount> weekly) {

    public record WeeklyCount(LocalDate weekStart, long count) {
    }
}
