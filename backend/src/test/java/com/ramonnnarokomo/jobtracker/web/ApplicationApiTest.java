package com.ramonnnarokomo.jobtracker.web;

import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ramonnnarokomo.jobtracker.domain.ApplicationDetails;
import com.ramonnnarokomo.jobtracker.domain.ApplicationStatus;
import com.ramonnnarokomo.jobtracker.domain.JobApplication;
import com.ramonnnarokomo.jobtracker.domain.WorkMode;
import com.ramonnnarokomo.jobtracker.repository.JobApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApplicationApiTest {

    /** Sunday 2026-09-20 at 10:00 in Madrid (08:00 UTC). */
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 9, 20, 10, 0);

    @TestConfiguration
    static class FixedClockConfig {

        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(Instant.parse("2026-09-20T08:00:00Z"), ZoneId.of("Europe/Madrid"));
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JobApplicationRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void createReturns201WithLocationAndTheNewApplication() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"company": "Acme Logistics", "position": "Desarrollador Full-Stack",
                                 "location": "Madrid", "workMode": "HYBRID", "source": "LinkedIn",
                                 "jobUrl": "https://example.com/jobs/1", "salaryMinK": 28, "salaryMaxK": 34,
                                 "status": "APPLIED", "notes": "Contactar con RR. HH."}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.company").value("Acme Logistics"))
                .andExpect(jsonPath("$.workMode").value("HYBRID"))
                .andExpect(jsonPath("$.salaryMaxK").value(34))
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.appliedAt").value("2026-09-20"))
                .andExpect(jsonPath("$.createdAt").value("2026-09-20T10:00:00"))
                .andExpect(jsonPath("$.updatedAt").value("2026-09-20T10:00:00"))
                .andExpect(jsonPath("$.daysSinceUpdate").value(0))
                .andExpect(jsonPath("$.followUpDue").value(false))
                .andExpect(jsonPath("$.history").doesNotExist())
                .andReturn();

        List<JobApplication> saved = repository.findAll();
        assertEquals(1, saved.size());
        String location = result.getResponse().getHeader("Location");
        assertTrue(location.endsWith("/api/applications/" + saved.get(0).getId()), location);
    }

    @Test
    void createWithoutStatusStartsInWishlist() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"company": "Nimbus Data", "position": "Desarrollador Java", "workMode": "REMOTE"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("WISHLIST"))
                .andExpect(jsonPath("$.appliedAt").value(nullValue()))
                .andExpect(jsonPath("$.location").value(nullValue()));
    }

    @Test
    void createWithInvalidFieldsReturns400WithErrorsPerField() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"company": "  ", "position": "Desarrollador Java",
                                 "jobUrl": "esto no es una url", "salaryMinK": -5}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.company").value("La empresa es obligatoria."))
                .andExpect(jsonPath("$.errors.workMode").value("La modalidad es obligatoria."))
                .andExpect(jsonPath("$.errors.jobUrl").value("La URL de la oferta no es válida."))
                .andExpect(jsonPath("$.errors.salaryMinK").value("El salario mínimo no puede ser negativo."))
                .andExpect(jsonPath("$.errors.position").doesNotExist());
    }

    @Test
    void createWithUnknownEnumValueReturns400() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"company": "Acme Logistics", "position": "Dev", "workMode": "FROM_THE_MOON"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void createWithMinimumSalaryAboveMaximumReturns422() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"company": "Acme Logistics", "position": "Dev", "workMode": "ONSITE",
                                 "salaryMinK": 40, "salaryMaxK": 30}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value("El salario mínimo no puede ser mayor que el máximo."));
    }

    @Test
    void listFiltersByStatusAndTextAndSortsByLastUpdate() throws Exception {
        save("Acme Logistics", "Desarrollador Full-Stack", ApplicationStatus.APPLIED, NOW.minusDays(3));
        save("Nimbus Data", "Desarrollador Java", ApplicationStatus.WISHLIST, NOW.minusDays(1));
        save("Lumen Health", "Frontend Developer", ApplicationStatus.APPLIED, NOW.minusDays(2));

        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].company").value("Nimbus Data"))
                .andExpect(jsonPath("$[2].company").value("Acme Logistics"));

        mockMvc.perform(get("/api/applications").param("status", "APPLIED"))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].company").value("Lumen Health"))
                .andExpect(jsonPath("$[1].company").value("Acme Logistics"));

        mockMvc.perform(get("/api/applications").param("q", "acme"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].company").value("Acme Logistics"));

        mockMvc.perform(get("/api/applications").param("q", "JAVA"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].company").value("Nimbus Data"));

        mockMvc.perform(get("/api/applications").param("status", "APPLIED").param("q", "java"))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getReturnsTheHistoryOldestFirst() throws Exception {
        JobApplication application = JobApplication.create(details("Acme Logistics"), ApplicationStatus.WISHLIST,
                NOW.minusDays(5));
        application.changeStatus(ApplicationStatus.APPLIED, NOW.minusDays(4));
        long id = repository.save(application).getId();

        mockMvc.perform(get("/api/applications/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Acme Logistics"))
                .andExpect(jsonPath("$.daysSinceUpdate").value(4))
                .andExpect(jsonPath("$.history.length()").value(2))
                .andExpect(jsonPath("$.history[0].fromStatus").value(nullValue()))
                .andExpect(jsonPath("$.history[0].toStatus").value("WISHLIST"))
                .andExpect(jsonPath("$.history[0].changedAt").value("2026-09-15T10:00:00"))
                .andExpect(jsonPath("$.history[1].fromStatus").value("WISHLIST"))
                .andExpect(jsonPath("$.history[1].toStatus").value("APPLIED"));
    }

    @Test
    void patchStatusWithAValidMoveReturns200() throws Exception {
        long id = save("Acme Logistics", "Dev", ApplicationStatus.WISHLIST, NOW.minusDays(5));

        mockMvc.perform(patch("/api/applications/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status": "APPLIED"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.appliedAt").value("2026-09-20"))
                .andExpect(jsonPath("$.updatedAt").value("2026-09-20T10:00:00"));

        mockMvc.perform(get("/api/applications/{id}", id))
                .andExpect(jsonPath("$.history.length()").value(2))
                .andExpect(jsonPath("$.history[1].toStatus").value("APPLIED"));
    }

    @Test
    void patchStatusWithAnInvalidMoveReturns422() throws Exception {
        long id = save("Acme Logistics", "Dev", ApplicationStatus.WISHLIST, NOW.minusDays(5));

        mockMvc.perform(patch("/api/applications/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status": "OFFER"}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.detail").value("No se puede pasar de «Por aplicar» a «Oferta»."));

        mockMvc.perform(get("/api/applications/{id}", id))
                .andExpect(jsonPath("$.status").value("WISHLIST"));
    }

    @Test
    void putReplacesTheFieldsButNotTheStatus() throws Exception {
        long id = save("Acme Logistics", "Dev", ApplicationStatus.APPLIED, NOW.minusDays(3));

        mockMvc.perform(put("/api/applications/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"company": "Acme Logistics S.L.", "position": "Desarrollador Full-Stack",
                                 "location": "Madrid", "workMode": "REMOTE", "salaryMinK": 30, "salaryMaxK": 36,
                                 "appliedAt": "2026-09-16", "notes": "Llamar el lunes", "status": "OFFER"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Acme Logistics S.L."))
                .andExpect(jsonPath("$.workMode").value("REMOTE"))
                .andExpect(jsonPath("$.appliedAt").value("2026-09-16"))
                .andExpect(jsonPath("$.notes").value("Llamar el lunes"))
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.createdAt").value("2026-09-17T10:00:00"))
                .andExpect(jsonPath("$.updatedAt").value("2026-09-20T10:00:00"))
                .andExpect(jsonPath("$.daysSinceUpdate").value(0));
    }

    @Test
    void deleteReturns204AndThenTheApplicationIsGone() throws Exception {
        long id = save("Acme Logistics", "Dev", ApplicationStatus.APPLIED, NOW.minusDays(3));

        mockMvc.perform(delete("/api/applications/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/applications/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.detail").value("Candidatura no encontrada."));

        mockMvc.perform(delete("/api/applications/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void statsHaveTheExpectedShape() throws Exception {
        // Applied 18 days ago and no news since: needs a follow-up.
        save("Acme Logistics", "Dev", ApplicationStatus.APPLIED, LocalDateTime.of(2026, 9, 2, 9, 0));
        JobApplication interview = JobApplication.create(details("Lumen Health"), ApplicationStatus.APPLIED,
                LocalDateTime.of(2026, 9, 15, 9, 0));
        interview.changeStatus(ApplicationStatus.INTERVIEW, LocalDateTime.of(2026, 9, 18, 12, 0));
        repository.save(interview);
        save("Nimbus Data", "Dev", ApplicationStatus.WISHLIST, NOW.minusDays(1));

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.byStatus.WISHLIST").value(1))
                .andExpect(jsonPath("$.byStatus.APPLIED").value(1))
                .andExpect(jsonPath("$.byStatus.INTERVIEW").value(1))
                .andExpect(jsonPath("$.byStatus.OFFER").value(0))
                .andExpect(jsonPath("$.byStatus.REJECTED").value(0))
                .andExpect(jsonPath("$.active").value(2))
                .andExpect(jsonPath("$.interviewRate").value(0.5))
                .andExpect(jsonPath("$.followUpDue").value(1))
                .andExpect(jsonPath("$.weekly.length()").value(8))
                .andExpect(jsonPath("$.weekly[0].weekStart").value("2026-07-27"))
                .andExpect(jsonPath("$.weekly[5].weekStart").value("2026-08-31"))
                .andExpect(jsonPath("$.weekly[5].count").value(1))
                .andExpect(jsonPath("$.weekly[7].weekStart").value("2026-09-14"))
                .andExpect(jsonPath("$.weekly[7].count").value(1));
    }

    private long save(String company, String position, ApplicationStatus status, LocalDateTime createdAt) {
        ApplicationDetails details = new ApplicationDetails(company, position, null, WorkMode.HYBRID,
                null, null, null, null, null, null);
        return repository.save(JobApplication.create(details, status, createdAt)).getId();
    }

    private static ApplicationDetails details(String company) {
        return new ApplicationDetails(company, "Desarrollador Java", "Madrid", WorkMode.HYBRID,
                "LinkedIn", null, null, null, null, null);
    }
}
