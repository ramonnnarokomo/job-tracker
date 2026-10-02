package com.ramonnnarokomo.jobtracker.domain;

import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.APPLIED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.INTERVIEW;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.OFFER;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStats.WeeklyCount;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Computes {@link ApplicationStats} from the applications (with their history loaded).
 * Plain Java with no I/O, so every number can be checked in a unit test.
 */
public final class StatsCalculator {

    static final int WEEKS = 8;

    /** Statuses still "in play" on the board. */
    private static final Set<ApplicationStatus> ACTIVE = Set.of(APPLIED, INTERVIEW, OFFER);
    /** Reaching any of these means the application was actually sent. */
    private static final Set<ApplicationStatus> SENT = Set.of(APPLIED, INTERVIEW, OFFER);
    private static final Set<ApplicationStatus> INTERVIEWED = Set.of(INTERVIEW, OFFER);

    private StatsCalculator() {
    }

    public static ApplicationStats calculate(List<JobApplication> applications, LocalDate today) {
        Map<ApplicationStatus, Long> byStatus = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            byStatus.put(status, 0L);
        }
        applications.forEach(application -> byStatus.merge(application.getStatus(), 1L, Long::sum));

        long active = ACTIVE.stream().mapToLong(byStatus::get).sum();
        long followUpDue = applications.stream().filter(application -> application.isFollowUpDue(today)).count();

        return new ApplicationStats(applications.size(), byStatus, active, interviewRate(applications),
                followUpDue, weekly(applications, today));
    }

    private static Double interviewRate(List<JobApplication> applications) {
        long sent = applications.stream().filter(application -> everReached(application, SENT)).count();
        if (sent == 0) {
            return null;
        }
        long interviewed = applications.stream().filter(application -> everReached(application, INTERVIEWED)).count();
        return Math.round(interviewed * 100.0 / sent) / 100.0;
    }

    private static boolean everReached(JobApplication application, Set<ApplicationStatus> statuses) {
        return application.getHistory().stream().anyMatch(change -> statuses.contains(change.getToStatus()));
    }

    private static List<WeeklyCount> weekly(List<JobApplication> applications, LocalDate today) {
        Map<LocalDate, Long> sentPerWeek = applications.stream()
                .map(JobApplication::getAppliedAt)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(StatsCalculator::weekStart, Collectors.counting()));

        LocalDate currentWeek = weekStart(today);
        List<WeeklyCount> weeks = new ArrayList<>();
        for (int weeksAgo = WEEKS - 1; weeksAgo >= 0; weeksAgo--) {
            LocalDate weekStart = currentWeek.minusWeeks(weeksAgo);
            weeks.add(new WeeklyCount(weekStart, sentPerWeek.getOrDefault(weekStart, 0L)));
        }
        return weeks;
    }

    private static LocalDate weekStart(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}
