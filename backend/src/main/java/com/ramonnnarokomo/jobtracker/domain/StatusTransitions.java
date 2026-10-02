package com.ramonnnarokomo.jobtracker.domain;

import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.APPLIED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.INTERVIEW;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.OFFER;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.REJECTED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.WISHLIST;

import java.util.Map;
import java.util.Set;

/**
 * Which status moves make sense on the board. A rejected application can be reopened
 * (back to APPLIED); moving to the same status is never a valid move.
 */
public final class StatusTransitions {

    private static final Map<ApplicationStatus, Set<ApplicationStatus>> ALLOWED = Map.of(
            WISHLIST, Set.of(APPLIED, REJECTED),
            APPLIED, Set.of(INTERVIEW, REJECTED),
            INTERVIEW, Set.of(OFFER, REJECTED),
            OFFER, Set.of(REJECTED),
            REJECTED, Set.of(APPLIED));

    private StatusTransitions() {
    }

    public static boolean isAllowed(ApplicationStatus from, ApplicationStatus to) {
        return ALLOWED.get(from).contains(to);
    }

    public static void requireAllowed(ApplicationStatus from, ApplicationStatus to) {
        if (!isAllowed(from, to)) {
            throw new BusinessRuleException(
                    "No se puede pasar de «%s» a «%s».".formatted(from.getLabel(), to.getLabel()));
        }
    }
}
