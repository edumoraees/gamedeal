package br.edu.atitus.gamedeal.catalog.controllers;

import br.edu.atitus.gamedeal.catalog.dtos.ListingResponse;
import br.edu.atitus.gamedeal.catalog.dtos.ReserveRequest;
import br.edu.atitus.gamedeal.catalog.services.ListingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de uso interno, chamados apenas pelo order-service.
 * O Gateway NÃO tem rota para /internal/**, então eles não são acessíveis de fora da rede Docker.
 */
@RestController
@RequestMapping("/internal/listings")
public class InternalListingController {

    private final ListingService service;

    public InternalListingController(ListingService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> find(@PathVariable Long id) {
        return ResponseEntity.ok(service.findInternal(id));
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<ListingResponse> reserve(@PathVariable Long id, @Valid @RequestBody ReserveRequest request) {
        return ResponseEntity.ok(service.reserve(id, request.quantity()));
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<Void> release(@PathVariable Long id, @Valid @RequestBody ReserveRequest request) {
        service.release(id, request.quantity());
        return ResponseEntity.noContent().build();
    }
}
