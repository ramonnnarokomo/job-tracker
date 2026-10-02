package com.ramonnnarokomo.jobtracker.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * A job application and its status history.
 * <p>
 * There are no setters: data changes through {@link #update}, and the status only through
 * {@link #changeStatus}, which checks the allowed transitions and records every move.
 * Time is always passed in, so the rules can be unit tested with fixed dates.
 */
@Entity
@Table(name = "job_applications")
public class JobApplication {

    static final int FOLLOW_UP_DAYS_AFTER_APPLYING = 14;
    static final int FOLLOW_UP_DAYS_AFTER_INTERVIEW = 7;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String company;

    @Column(nullable = false, length = 100)
    private String position;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkMode workMode;

    @Column(length = 60)
    private String source;

    @Column(length = 500)
    private String jobUrl;

    /** Gross yearly salary, in thousands of euros. */
    private Integer salaryMinK;

    private Integer salaryMaxK;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    private LocalDate appliedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(length = 2000)
    private String notes;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC, id ASC")
    private List<StatusChange> history = new ArrayList<>();

    protected JobApplication() {
        // required by JPA
    }

    /**
     * New applications start in WISHLIST or, if already sent, in APPLIED
     * (then {@code appliedAt} defaults to the creation day).
     */
    public static JobApplication create(ApplicationDetails details, ApplicationStatus initialStatus, LocalDateTime now) {
        if (initialStatus != ApplicationStatus.WISHLIST && initialStatus != ApplicationStatus.APPLIED) {
            throw new BusinessRuleException("Una candidatura nueva solo puede empezar en «Por aplicar» o «Aplicado».");
        }
        JobApplication application = new JobApplication();
        application.applyDetails(details);
        application.createdAt = now;
        application.recordStatus(initialStatus, now);
        return application;
    }

    public void update(ApplicationDetails details, LocalDateTime now) {
        applyDetails(details);
        updatedAt = now;
    }

    public void changeStatus(ApplicationStatus newStatus, LocalDateTime now) {
        StatusTransitions.requireAllowed(status, newStatus);
        recordStatus(newStatus, now);
    }

    public long daysSinceUpdate(LocalDate today) {
        return ChronoUnit.DAYS.between(updatedAt.toLocalDate(), today);
    }

    /** True when it is time to chase the company: no news for too long after applying or interviewing. */
    public boolean isFollowUpDue(LocalDate today) {
        long days = daysSinceUpdate(today);
        return switch (status) {
            case APPLIED -> days >= FOLLOW_UP_DAYS_AFTER_APPLYING;
            case INTERVIEW -> days >= FOLLOW_UP_DAYS_AFTER_INTERVIEW;
            default -> false;
        };
    }

    private void recordStatus(ApplicationStatus newStatus, LocalDateTime now) {
        history.add(new StatusChange(this, status, newStatus, now));
        status = newStatus;
        updatedAt = now;
        if (newStatus == ApplicationStatus.APPLIED && appliedAt == null) {
            appliedAt = now.toLocalDate();
        }
    }

    private void applyDetails(ApplicationDetails details) {
        Integer min = details.salaryMinK();
        Integer max = details.salaryMaxK();
        if (min != null && max != null && min > max) {
            throw new BusinessRuleException("El salario mínimo no puede ser mayor que el máximo.");
        }
        company = details.company();
        position = details.position();
        location = details.location();
        workMode = details.workMode();
        source = details.source();
        jobUrl = details.jobUrl();
        salaryMinK = min;
        salaryMaxK = max;
        appliedAt = details.appliedAt();
        notes = details.notes();
    }

    public Long getId() {
        return id;
    }

    public String getCompany() {
        return company;
    }

    public String getPosition() {
        return position;
    }

    public String getLocation() {
        return location;
    }

    public WorkMode getWorkMode() {
        return workMode;
    }

    public String getSource() {
        return source;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public Integer getSalaryMinK() {
        return salaryMinK;
    }

    public Integer getSalaryMaxK() {
        return salaryMaxK;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public LocalDate getAppliedAt() {
        return appliedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getNotes() {
        return notes;
    }

    /** Status changes, oldest first. Read-only: use {@link #changeStatus} to add one. */
    public List<StatusChange> getHistory() {
        return Collections.unmodifiableList(history);
    }
}
