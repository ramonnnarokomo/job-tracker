package com.ramonnnarokomo.jobtracker.service;

public class ApplicationNotFoundException extends RuntimeException {

    public ApplicationNotFoundException() {
        super("Candidatura no encontrada.");
    }
}
