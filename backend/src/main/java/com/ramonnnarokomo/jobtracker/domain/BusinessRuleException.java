package com.ramonnnarokomo.jobtracker.domain;

/**
 * A request that is well-formed but breaks a domain rule (for example an invalid
 * status transition). The API turns it into a 422 response; the message is shown to the user.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
