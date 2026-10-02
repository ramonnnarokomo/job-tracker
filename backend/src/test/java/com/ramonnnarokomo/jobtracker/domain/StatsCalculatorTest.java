package com.ramonnnarokomo.jobtracker.domain;

import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.APPLIED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.INTERVIEW;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.OFFER;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.REJECTED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.WISHLIST;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStats.WeeklyCount;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

class StatsCalculatorTest {

    // A Friday: the current week starts on Monday 2026-09-28.
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 2);
    private static final LocalDateTime NOW = TODAY.atTime(10, 0);

    @Test
    void emptyListGivesZerosAndNoInterviewRate() {
        ApplicationStats stats = StatsCalculator.calculate(List.of(), TODAY);

        assertEquals(0, stats.total());
        assertEquals(Map.of(WISHLIST, 0L, APPLIED, 0L, INTERVIEW, 0L, OFFER, 0L, REJECTED, 0L), stats.byStatus());
        assertEquals(0, stats.active());
        assertNull(stats.interviewRate());
        assertEquals(0, stats.followUpDue());
        assertEquals(8, stats.weekly().size());
        stats.weekly().forEach(week -> assertEquals(0, week.count()));
    }

    @Test
    void countsByStatusAndActive() {
        List<JobApplication> applications = List.of(
                wishlist(),
                applied(TODAY),
                applied(TODAY),
                interview(),
                offer(),
                rejectedFromWishlist());

        ApplicationStats stats = StatsCalculator.calculate(applications, TODAY);

        assertEquals(6, stats.total());
        assertEquals(Map.of(WISHLIST, 1L, APPLIED, 2L, INTERVIEW, 1L, OFFER, 1L, REJECTED, 1L), stats.byStatus());
        assertEquals(4, stats.active());
    }

    @Test
    void interviewRateUsesTheHistoryAndOnlyCountsSentApplications() {
        JobApplication rejectedAfterInterview = interview();
        rejectedAfterInterview.changeStatus(REJECTED, NOW);
        JobApplication rejectedAfterApplying = applied(TODAY);
        rejectedAfterApplying.changeStatus(REJECTED, NOW);

        // Sent: the three last ones. Reached an interview: two of them.
        List<JobApplication> applications = List.of(
                wishlist(),
                rejectedFromWishlist(),
                rejectedAfterInterview,
                rejectedAfterApplying,
                offer());

        ApplicationStats stats = StatsCalculator.calculate(applications, TODAY);

        assertEquals(0.67, stats.interviewRate());
    }

    @Test
    void interviewRateIsNullWhenNothingWasSent() {
        ApplicationStats stats = StatsCalculator.calculate(List.of(wishlist(), rejectedFromWishlist()), TODAY);

        assertNull(stats.interviewRate());
    }

    @Test
    void countsApplicationsThatNeedAFollowUp() {
        JobApplication staleApplied = JobApplication.create(details(null), APPLIED, NOW.minusDays(20));
        JobApplication freshApplied = JobApplication.create(details(null), APPLIED, NOW.minusDays(3));

        ApplicationStats stats = StatsCalculator.calculate(List.of(staleApplied, freshApplied, wishlist()), TODAY);

        assertEquals(1, stats.followUpDue());
    }

    @Test
    void weeklyCoversTheLastEightWeeksStartingOnMonday() {
        List<JobApplication> applications = List.of(
                applied(LocalDate.of(2026, 10, 2)),   // current week
                applied(LocalDate.of(2026, 9, 28)),   // Monday of the current week
                applied(LocalDate.of(2026, 9, 27)),   // Sunday: previous week
                applied(LocalDate.of(2026, 8, 10)),   // first day of the oldest week
                applied(LocalDate.of(2026, 8, 9)),    // too old: not counted
                wishlist());                          // never sent: not counted

        List<WeeklyCount> weekly = StatsCalculator.calculate(applications, TODAY).weekly();

        assertEquals(List.of(
                new WeeklyCount(LocalDate.of(2026, 8, 10), 1),
                new WeeklyCount(LocalDate.of(2026, 8, 17), 0),
                new WeeklyCount(LocalDate.of(2026, 8, 24), 0),
                new WeeklyCount(LocalDate.of(2026, 8, 31), 0),
                new WeeklyCount(LocalDate.of(2026, 9, 7), 0),
                new WeeklyCount(LocalDate.of(2026, 9, 14), 0),
                new WeeklyCount(LocalDate.of(2026, 9, 21), 1),
                new WeeklyCount(LocalDate.of(2026, 9, 28), 2)), weekly);
    }

    private static JobApplication wishlist() {
        return JobApplication.create(details(null), WISHLIST, NOW);
    }

    private static JobApplication applied(LocalDate appliedAt) {
        return JobApplication.create(details(appliedAt), APPLIED, NOW);
    }

    private static JobApplication interview() {
        JobApplication application = applied(TODAY);
        application.changeStatus(INTERVIEW, NOW);
        return application;
    }

    private static JobApplication offer() {
        JobApplication application = interview();
        application.changeStatus(OFFER, NOW);
        return application;
    }

    private static JobApplication rejectedFromWishlist() {
        JobApplication application = wishlist();
        application.changeStatus(REJECTED, NOW);
        return application;
    }

    private static ApplicationDetails details(LocalDate appliedAt) {
        return new ApplicationDetails("Acme Logistics", "Desarrollador Java", null, WorkMode.REMOTE,
                null, null, null, null, appliedAt, null);
    }
}
