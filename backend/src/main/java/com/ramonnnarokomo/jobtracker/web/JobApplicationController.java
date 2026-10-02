package com.ramonnnarokomo.jobtracker.web;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStatus;
import com.ramonnnarokomo.jobtracker.service.JobApplicationService;
import com.ramonnnarokomo.jobtracker.web.dto.ApplicationRequest;
import com.ramonnnarokomo.jobtracker.web.dto.ApplicationResponse;
import com.ramonnnarokomo.jobtracker.web.dto.StatusChangeRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    /** Both filters are optional; {@code q} searches company and position, ignoring case. */
    @GetMapping
    public List<ApplicationResponse> list(@RequestParam(required = false) ApplicationStatus status,
                                          @RequestParam(required = false) String q) {
        return service.findAll(status, q);
    }

    @GetMapping("/{id}")
    public ApplicationResponse get(@PathVariable long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> create(@Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(@PathVariable long id, @Valid @RequestBody ApplicationRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse changeStatus(@PathVariable long id, @Valid @RequestBody StatusChangeRequest request) {
        return service.changeStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        service.delete(id);
    }
}
