package com.ramonnnarokomo.jobtracker.service;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStats;
import com.ramonnnarokomo.jobtracker.domain.StatsCalculator;
import com.ramonnnarokomo.jobtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;

@Service
public class StatsService {

    private final JobApplicationRepository repository;
    private final Clock clock;

    public StatsService(JobApplicationRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ApplicationStats getStats() {
        return StatsCalculator.calculate(repository.findAllWithHistory(), LocalDate.now(clock));
    }
}
