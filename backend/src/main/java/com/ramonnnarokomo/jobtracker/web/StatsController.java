package com.ramonnnarokomo.jobtracker.web;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStats;
import com.ramonnnarokomo.jobtracker.service.StatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/api/stats")
    public ApplicationStats stats() {
        return statsService.getStats();
    }
}
