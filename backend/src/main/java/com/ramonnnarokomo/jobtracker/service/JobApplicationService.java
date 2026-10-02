package com.ramonnnarokomo.jobtracker.service;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStatus;
import com.ramonnnarokomo.jobtracker.domain.JobApplication;
import com.ramonnnarokomo.jobtracker.repository.JobApplicationRepository;
import com.ramonnnarokomo.jobtracker.web.dto.ApplicationRequest;
import com.ramonnnarokomo.jobtracker.web.dto.ApplicationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Use cases of the board. Entities are mapped to responses inside the transaction,
 * because open-in-view is disabled and the history is loaded lazily.
 */
@Service
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final Clock clock;

    public JobApplicationService(JobApplicationRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> findAll(ApplicationStatus status, String query) {
        String text = query == null ? "" : query.strip();
        LocalDate today = today();
        return repository.search(status, text).stream()
                .map(application -> ApplicationResponse.from(application, today))
                .toList();
    }

    @Transactional(readOnly = true)
    public ApplicationResponse findById(long id) {
        return ApplicationResponse.withHistory(getApplication(id), today());
    }

    public ApplicationResponse create(ApplicationRequest request) {
        JobApplication application = JobApplication.create(request.toDetails(), request.statusOrDefault(), now());
        return ApplicationResponse.from(repository.save(application), today());
    }

    /** Replaces the editable fields. The status is ignored here: it only changes through {@link #changeStatus}. */
    public ApplicationResponse update(long id, ApplicationRequest request) {
        JobApplication application = getApplication(id);
        application.update(request.toDetails(), now());
        return ApplicationResponse.from(application, today());
    }

    public ApplicationResponse changeStatus(long id, ApplicationStatus newStatus) {
        JobApplication application = getApplication(id);
        application.changeStatus(newStatus, now());
        return ApplicationResponse.from(application, today());
    }

    public void delete(long id) {
        repository.delete(getApplication(id));
    }

    private JobApplication getApplication(long id) {
        return repository.findById(id).orElseThrow(ApplicationNotFoundException::new);
    }

    // Whole seconds are enough, and the value is then the same before and after saving it.
    private LocalDateTime now() {
        return LocalDateTime.now(clock).truncatedTo(ChronoUnit.SECONDS);
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }
}
