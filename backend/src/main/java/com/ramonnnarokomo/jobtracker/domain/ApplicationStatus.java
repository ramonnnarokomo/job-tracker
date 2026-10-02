package com.ramonnnarokomo.jobtracker.domain;

/**
 * Columns of the Kanban board. The label is the Spanish name shown to the user,
 * used here to build readable error messages.
 */
public enum ApplicationStatus {

    WISHLIST("Por aplicar"),
    APPLIED("Aplicado"),
    INTERVIEW("Entrevista"),
    OFFER("Oferta"),
    REJECTED("Descartado");

    private final String label;

    ApplicationStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
