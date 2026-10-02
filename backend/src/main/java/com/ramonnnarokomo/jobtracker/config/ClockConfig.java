package com.ramonnnarokomo.jobtracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Single source of "now". Injecting a Clock instead of calling LocalDate.now() lets
 * the tests replace it with a fixed one, and the zone does not depend on the server.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Europe/Madrid"));
    }
}
