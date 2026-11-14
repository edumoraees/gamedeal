package br.edu.atitus.gamedeal.catalog.controllers;

import br.edu.atitus.gamedeal.catalog.dtos.*;
import br.edu.atitus.gamedeal.catalog.entities.ListingCategory;
import br.edu.atitus.gamedeal.catalog.services.ListingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ListingController {

    private final ListingService service;

    public ListingController(ListingService service) {
        this.service = service;
    }

    // ---------------- Rotas públicas ----------------

    @GetMapping("/games")
    public ResponseEntity<List<GameResponse>> games() {
        return ResponseEntity.ok(service.listGames());
    }

    @GetMapping("/listings")
    public ResponseEntity<PageResponse<ListingResponse>> search(
            @RequestParam(required = false) ListingCategory category,
            @RequestParam(required = false) Long gameId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String currency,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(service.search(category, gameId, sellerId, subcategory, search, currency,
                page, size, sort));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ListingResponse> findById(@PathVariable Long id,
                                                    @RequestParam(required = false) String currency) {
        return ResponseEntity.ok(service.findPublicById(id, currency));
    }

    // ---------------- Rotas protegidas (/ws) ----------------

    @PostMapping("/ws/listings")
    public ResponseEntity<ListingResponse> create(@RequestHeader("X-User-Id") Long userId,
                                                  @RequestHeader("X-User-Name") String username,
                                                  @Valid @RequestBody ListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(userId, username, request));
    }

    @GetMapping("/ws/listings/mine")
    public ResponseEntity<List<ListingResponse>> mine(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.findMine(userId));
    }

    @PutMapping("/ws/listings/{id}")
    public ResponseEntity<ListingResponse> update(@RequestHeader("X-User-Id") Long userId,
                                                  @PathVariable Long id,
                                                  @Valid @RequestBody ListingRequest request) {
        return ResponseEntity.ok(service.update(userId, id, request));
    }

    @PatchMapping("/ws/listings/{id}/status")
    public ResponseEntity<ListingResponse> changeStatus(@RequestHeader("X-User-Id") Long userId,
                                                        @PathVariable Long id,
                                                        @Valid @RequestBody ListingStatusRequest request) {
        return ResponseEntity.ok(service.changeStatus(userId, id, request));
    }

    @DeleteMapping("/ws/listings/{id}")
    public ResponseEntity<Void> remove(@RequestHeader("X-User-Id") Long userId, @PathVariable Long id) {
        service.remove(userId, id);
        return ResponseEntity.noContent().build();
    }
}
