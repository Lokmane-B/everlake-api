package com.everlake.ingestion.web;

import com.everlake.ingestion.service.InseeService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/insee")
public class InseeController {
    private final InseeService service;
    public InseeController(InseeService service) { this.service = service; }

    @GetMapping("/siren/{siren}")
    public Mono<String> getBySiren(@PathVariable("siren") String siren) {
        return service.getEntrepriseBySiren(siren);
    }

}
