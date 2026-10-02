package com.ramonnnarokomo.jobtracker.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

/** Title shown in Swagger UI (http://localhost:8081/swagger-ui.html). */
@Configuration
@OpenAPIDefinition(info = @Info(
        title = "Job Tracker API",
        version = "1.0",
        description = "Candidaturas de empleo: tablero Kanban, historial de estados y estadísticas."))
public class OpenApiConfig {
}
