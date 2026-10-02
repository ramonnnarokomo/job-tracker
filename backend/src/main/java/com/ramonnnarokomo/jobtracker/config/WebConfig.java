package com.ramonnnarokomo.jobtracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * The Vite dev server proxies /api, so normally the browser never needs CORS. This mapping
 * covers the frontend calling the API directly, from {@code vite} (5173) or {@code vite preview} (4173).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:4173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                .exposedHeaders("Location");
    }
}
