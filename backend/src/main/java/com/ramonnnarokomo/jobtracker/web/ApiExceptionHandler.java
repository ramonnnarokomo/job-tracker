package com.ramonnnarokomo.jobtracker.web;

import com.ramonnnarokomo.jobtracker.domain.BusinessRuleException;
import com.ramonnnarokomo.jobtracker.service.ApplicationNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Turns errors into RFC 9457 problem details. Extending {@link ResponseEntityExceptionHandler}
 * keeps Spring's handling of the standard MVC errors (405, 415...) and lets us customise
 * the two that the frontend shows to the user.
 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ApplicationNotFoundException.class)
    public ProblemDetail handleNotFound(ApplicationNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ProblemDetail handleBusinessRule(BusinessRuleException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }

    /** Bean Validation errors: adds an {@code errors} map (field -> message) so the form can show them. */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers, HttpStatusCode status,
                                                                  WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, "Hay campos con errores.");
        problem.setProperty("errors", errors);
        return handleExceptionInternal(ex, problem, headers, status, request);
    }

    /** Malformed JSON or a value that does not fit the field type (e.g. an unknown enum value). */
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                                                                  HttpHeaders headers, HttpStatusCode status,
                                                                  WebRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status,
                "El cuerpo de la petición no es un JSON válido o tiene valores no permitidos.");
        return handleExceptionInternal(ex, problem, headers, status, request);
    }
}
