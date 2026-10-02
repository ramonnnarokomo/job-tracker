package com.ramonnnarokomo.jobtracker.config;

import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.APPLIED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.INTERVIEW;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.OFFER;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.REJECTED;
import static com.ramonnnarokomo.jobtracker.domain.ApplicationStatus.WISHLIST;

import com.ramonnnarokomo.jobtracker.domain.ApplicationDetails;
import com.ramonnnarokomo.jobtracker.domain.JobApplication;
import com.ramonnnarokomo.jobtracker.domain.WorkMode;
import com.ramonnnarokomo.jobtracker.repository.JobApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Fills an empty database with fictional applications from the last weeks, so the board
 * and the stats have something to show on the first run. Every application is built
 * through the domain methods with past timestamps, so its history is consistent.
 * Disabled in tests.
 */
@Component
@Profile("!test")
public class DemoDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataLoader.class);

    private final JobApplicationRepository repository;
    private final Clock clock;

    public DemoDataLoader(JobApplicationRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        List<JobApplication> applications = demoApplications(LocalDate.now(clock).atTime(9, 30));
        repository.saveAll(applications);
        log.info("Inserted {} demo job applications", applications.size());
    }

    private List<JobApplication> demoApplications(LocalDateTime base) {
        JobApplication acme = JobApplication.create(new ApplicationDetails(
                "Acme Logistics", "Desarrollador Full-Stack Angular/Spring", "Madrid", WorkMode.HYBRID,
                "LinkedIn", "https://example.com/empleo/acme-fullstack", 28, 34, null,
                "Oferta verbal: 32K y dos días de teletrabajo. Responder antes del viernes."),
                WISHLIST, base.minusDays(47));
        acme.changeStatus(APPLIED, base.minusDays(45));
        acme.changeStatus(INTERVIEW, base.minusDays(31));
        acme.changeStatus(OFFER, base.minusDays(4));

        JobApplication nimbus = JobApplication.create(new ApplicationDetails(
                "Nimbus Data", "Desarrollador Java Junior", "Madrid", WorkMode.ONSITE,
                "InfoJobs", null, 24, 28, null,
                "Sin respuesta todavía. Escribir a la persona de selección."),
                APPLIED, base.minusDays(20));

        JobApplication vertice = JobApplication.create(new ApplicationDetails(
                "Vértice Software", "Desarrollador Frontend React", "Remoto (España)", WorkMode.REMOTE,
                "LinkedIn", "https://example.com/empleo/vertice-react", null, null, null,
                "Piden dos años con React; aplicar igualmente con el proyecto de fin de ciclo."),
                WISHLIST, base.minusDays(3));

        JobApplication hoplite = JobApplication.create(new ApplicationDetails(
                "Hoplite Games", "Desarrollador Backend Java", "Barcelona", WorkMode.HYBRID,
                "Web de la empresa", "https://example.com/empleo/hoplite-backend", 30, 38, null,
                "Prueba técnica superada, pero buscaban más experiencia con Kafka."),
                WISHLIST, base.minusDays(52));
        hoplite.changeStatus(APPLIED, base.minusDays(50));
        hoplite.changeStatus(INTERVIEW, base.minusDays(40));
        hoplite.changeStatus(REJECTED, base.minusDays(33));

        JobApplication lumen = JobApplication.create(new ApplicationDetails(
                "Lumen Health", "Desarrollador Full-Stack Spring Boot + React", "Madrid", WorkMode.HYBRID,
                "Referido", null, 30, 36, null,
                "Primera entrevista técnica hecha. Pendiente de la segunda con el CTO."),
                APPLIED, base.minusDays(17));
        lumen.changeStatus(INTERVIEW, base.minusDays(9));

        JobApplication orbital = JobApplication.create(new ApplicationDetails(
                "Orbital Fintech", "Ingeniero de Software Junior", "Madrid", WorkMode.ONSITE,
                "LinkedIn", "https://example.com/empleo/orbital-junior", 27, 32, null, null),
                APPLIED, base.minusDays(10));

        JobApplication kraken = JobApplication.create(new ApplicationDetails(
                "Kraken Retail", "Desarrollador Angular", "Valencia", WorkMode.REMOTE,
                "Tecnoempleo", null, null, null, null,
                "Respuesta automática: proceso cerrado."),
                APPLIED, base.minusDays(27));
        kraken.changeStatus(REJECTED, base.minusDays(21));

        JobApplication bosque = JobApplication.create(new ApplicationDetails(
                "Bosque Energía", "Desarrollador Java / Spring Boot", "Sevilla", WorkMode.HYBRID,
                "InfoJobs", "https://example.com/empleo/bosque-java", 26, 30, null, null),
                WISHLIST, base.minusDays(19));
        bosque.changeStatus(APPLIED, base.minusDays(15));

        JobApplication tesela = JobApplication.create(new ApplicationDetails(
                "Tesela Labs", "Desarrollador Frontend Angular", "Madrid", WorkMode.HYBRID,
                "Meetup", null, null, null, null,
                "Entrevista con el equipo de producto. Preguntaron por RxJS y signals."),
                WISHLIST, base.minusDays(8));
        tesela.changeStatus(APPLIED, base.minusDays(5));
        tesela.changeStatus(INTERVIEW, base.minusDays(1));

        return List.of(acme, nimbus, vertice, hoplite, lumen, orbital, kraken, bosque, tesela);
    }
}
