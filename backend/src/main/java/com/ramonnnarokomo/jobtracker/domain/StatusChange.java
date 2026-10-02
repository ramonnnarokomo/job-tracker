package com.ramonnnarokomo.jobtracker.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * One entry of an application's history. {@code fromStatus} is null for the first entry,
 * written when the application is created. Only {@link JobApplication} creates them.
 */
@Entity
@Table(name = "status_changes")
public class StatusChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus toStatus;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    protected StatusChange() {
        // required by JPA
    }

    StatusChange(JobApplication application, ApplicationStatus fromStatus, ApplicationStatus toStatus,
                 LocalDateTime changedAt) {
        this.application = application;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedAt = changedAt;
    }

    public Long getId() {
        return id;
    }

    public ApplicationStatus getFromStatus() {
        return fromStatus;
    }

    public ApplicationStatus getToStatus() {
        return toStatus;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }
}
