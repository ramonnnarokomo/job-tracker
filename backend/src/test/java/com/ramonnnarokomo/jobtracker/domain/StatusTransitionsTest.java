package com.ramonnnarokomo.jobtracker.domain;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;

class StatusTransitionsTest {

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({
            "WISHLIST, APPLIED",
            "WISHLIST, REJECTED",
            "APPLIED, INTERVIEW",
            "APPLIED, REJECTED",
            "INTERVIEW, OFFER",
            "INTERVIEW, REJECTED",
            "OFFER, REJECTED",
            "REJECTED, APPLIED"
    })
    void allowsTheBoardMoves(ApplicationStatus from, ApplicationStatus to) {
        assertTrue(StatusTransitions.isAllowed(from, to));
        assertDoesNotThrow(() -> StatusTransitions.requireAllowed(from, to));
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({
            "WISHLIST, INTERVIEW",
            "WISHLIST, OFFER",
            "APPLIED, WISHLIST",
            "APPLIED, OFFER",
            "INTERVIEW, WISHLIST",
            "INTERVIEW, APPLIED",
            "OFFER, WISHLIST",
            "OFFER, APPLIED",
            "OFFER, INTERVIEW",
            "REJECTED, WISHLIST",
            "REJECTED, INTERVIEW",
            "REJECTED, OFFER"
    })
    void rejectsSkippingOrGoingBack(ApplicationStatus from, ApplicationStatus to) {
        assertFalse(StatusTransitions.isAllowed(from, to));
        assertThrows(BusinessRuleException.class, () -> StatusTransitions.requireAllowed(from, to));
    }

    @ParameterizedTest
    @EnumSource(ApplicationStatus.class)
    void rejectsStayingInTheSameStatus(ApplicationStatus status) {
        assertFalse(StatusTransitions.isAllowed(status, status));
    }

    @Test
    void errorMessageUsesTheSpanishLabels() {
        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> StatusTransitions.requireAllowed(ApplicationStatus.APPLIED, ApplicationStatus.OFFER));

        assertEquals("No se puede pasar de «Aplicado» a «Oferta».", ex.getMessage());
    }
}
