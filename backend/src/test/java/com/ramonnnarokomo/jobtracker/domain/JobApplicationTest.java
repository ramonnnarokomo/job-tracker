package com.ramonnnarokomo.jobtracker.domain;

import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.APPLIED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.INTERVIEW;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.OFFER;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.REJECTED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.WISHLIST;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

class JobApplicationTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 9, 20, 10, 0);
    private static final LocalDate TODAY = NOW.toLocalDate();

    @Test
    void createStartsInWishlistAndRecordsTheInitialChange() {
        JobApplication application = JobApplication.create(details(null, null, null), WISHLIST, NOW);

        assertEquals(WISHLIST, application.getStatus());
        assertNull(application.getAppliedAt());
        assertEquals(NOW, application.getCreatedAt());
        assertEquals(NOW, application.getUpdatedAt());

        List<StatusChange> history = application.getHistory();
        assertEquals(1, history.size());
        assertNull(history.get(0).getFromStatus());
        assertEquals(WISHLIST, history.get(0).getToStatus());
        assertEquals(NOW, history.get(0).getChangedAt());
    }

    @Test
    void createAsAppliedDefaultsAppliedAtToToday() {
        JobApplication application = JobApplication.create(details(null, null, null), APPLIED, NOW);

        assertEquals(APPLIED, application.getStatus());
        assertEquals(TODAY, application.getAppliedAt());
    }

    @Test
    void createAsAppliedKeepsTheGivenAppliedAt() {
        LocalDate lastWeek = TODAY.minusDays(7);

        JobApplication application = JobApplication.create(details(null, null, lastWeek), APPLIED, NOW);

        assertEquals(lastWeek, application.getAppliedAt());
    }

    @Test
    void createOnlyAcceptsWishlistOrApplied() {
        assertThrows(BusinessRuleException.class,
                () -> JobApplication.create(details(null, null, null), INTERVIEW, NOW));
        assertThrows(BusinessRuleException.class,
                () -> JobApplication.create(details(null, null, null), OFFER, NOW));
    }

    @Test
    void createTrimsTextAndTurnsBlankFieldsIntoNull() {
        ApplicationDetails details = new ApplicationDetails("  Acme Logistics ", "Dev", "   ", WorkMode.REMOTE,
                "", null, null, null, null, " ");

        JobApplication application = JobApplication.create(details, WISHLIST, NOW);

        assertEquals("Acme Logistics", application.getCompany());
        assertNull(application.getLocation());
        assertNull(application.getSource());
        assertNull(application.getNotes());
    }

    @Test
    void changeStatusRecordsHistoryAndUpdatesTimestamps() {
        JobApplication application = JobApplication.create(details(null, null, null), WISHLIST, NOW.minusDays(3));

        application.changeStatus(APPLIED, NOW);

        assertEquals(APPLIED, application.getStatus());
        assertEquals(NOW, application.getUpdatedAt());
        assertEquals(NOW.minusDays(3), application.getCreatedAt());
        assertEquals(TODAY, application.getAppliedAt());

        List<StatusChange> history = application.getHistory();
        assertEquals(2, history.size());
        assertEquals(WISHLIST, history.get(1).getFromStatus());
        assertEquals(APPLIED, history.get(1).getToStatus());
        assertEquals(NOW, history.get(1).getChangedAt());
    }

    @Test
    void reopeningKeepsTheOriginalAppliedAt() {
        JobApplication application = JobApplication.create(details(null, null, null), APPLIED, NOW.minusDays(30));
        application.changeStatus(REJECTED, NOW.minusDays(10));

        application.changeStatus(APPLIED, NOW);

        assertEquals(TODAY.minusDays(30), application.getAppliedAt());
        assertEquals(3, application.getHistory().size());
    }

    @Test
    void invalidTransitionLeavesTheApplicationUntouched() {
        JobApplication application = JobApplication.create(details(null, null, null), APPLIED, NOW.minusDays(1));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> application.changeStatus(OFFER, NOW));

        assertEquals("No se puede pasar de «Aplicado» a «Oferta».", ex.getMessage());
        assertEquals(APPLIED, application.getStatus());
        assertEquals(NOW.minusDays(1), application.getUpdatedAt());
        assertEquals(1, application.getHistory().size());
    }

    @Test
    void minimumSalaryCannotBeAboveMaximum() {
        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> JobApplication.create(details(40, 30, null), WISHLIST, NOW));

        assertEquals("El salario mínimo no puede ser mayor que el máximo.", ex.getMessage());
        assertDoesNotThrow(() -> JobApplication.create(details(30, 30, null), WISHLIST, NOW));
        assertDoesNotThrow(() -> JobApplication.create(details(40, null, null), WISHLIST, NOW));
        assertDoesNotThrow(() -> JobApplication.create(details(null, 30, null), WISHLIST, NOW));
    }

    @Test
    void updateReplacesTheDetailsAndChecksTheSalaries() {
        JobApplication application = JobApplication.create(details(null, null, null), WISHLIST, NOW.minusDays(2));
        ApplicationDetails changed = new ApplicationDetails("Nimbus Data", "Desarrollador Java", "Madrid",
                WorkMode.ONSITE, "InfoJobs", "https://example.com/jobs/2", 26, 30, null, "Llamar el lunes");

        application.update(changed, NOW);

        assertEquals("Nimbus Data", application.getCompany());
        assertEquals(WorkMode.ONSITE, application.getWorkMode());
        assertEquals(30, application.getSalaryMaxK());
        assertEquals(NOW, application.getUpdatedAt());
        assertEquals(WISHLIST, application.getStatus());
        assertThrows(BusinessRuleException.class, () -> application.update(details(35, 30, null), NOW));
    }

    @Test
    void followUpIsDueFourteenDaysAfterApplying() {
        JobApplication thirteenDays = JobApplication.create(details(null, null, null), APPLIED, NOW.minusDays(13));
        JobApplication fourteenDays = JobApplication.create(details(null, null, null), APPLIED, NOW.minusDays(14));

        assertEquals(13, thirteenDays.daysSinceUpdate(TODAY));
        assertFalse(thirteenDays.isFollowUpDue(TODAY));
        assertEquals(14, fourteenDays.daysSinceUpdate(TODAY));
        assertTrue(fourteenDays.isFollowUpDue(TODAY));
    }

    @Test
    void followUpIsDueSevenDaysAfterAnInterview() {
        assertFalse(interviewUpdatedDaysAgo(6).isFollowUpDue(TODAY));
        assertTrue(interviewUpdatedDaysAgo(7).isFollowUpDue(TODAY));
    }

    @Test
    void followUpIsNeverDueInOtherStatuses() {
        JobApplication wishlist = JobApplication.create(details(null, null, null), WISHLIST, NOW.minusDays(60));
        JobApplication offer = interviewUpdatedDaysAgo(60);
        offer.changeStatus(OFFER, NOW.minusDays(30));

        assertFalse(wishlist.isFollowUpDue(TODAY));
        assertFalse(offer.isFollowUpDue(TODAY));
    }

    private static JobApplication interviewUpdatedDaysAgo(int days) {
        JobApplication application = JobApplication.create(details(null, null, null), APPLIED, NOW.minusDays(days + 5));
        application.changeStatus(INTERVIEW, NOW.minusDays(days));
        return application;
    }

    private static ApplicationDetails details(Integer salaryMinK, Integer salaryMaxK, LocalDate appliedAt) {
        return new ApplicationDetails("Acme Logistics", "Desarrollador Full-Stack", "Madrid", WorkMode.HYBRID,
                "LinkedIn", null, salaryMinK, salaryMaxK, appliedAt, null);
    }
}
