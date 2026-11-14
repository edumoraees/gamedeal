package br.edu.atitus.gamedeal.order.controllers;

import br.edu.atitus.gamedeal.order.dtos.*;
import br.edu.atitus.gamedeal.order.services.OrderService;
import br.edu.atitus.gamedeal.order.services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Todas as rotas aqui são protegidas (/ws): o Gateway valida o JWT e envia a identidade nos cabeçalhos. */
@RestController
@RequestMapping("/ws/orders")
public class OrderController {

    private final OrderService orderService;
    private final ReviewService reviewService;

    public OrderController(OrderService orderService, ReviewService reviewService) {
        this.orderService = orderService;
        this.reviewService = reviewService;
    }

    /** Resumo de valores antes de comprar (tela de finalização). */
    @GetMapping("/quote")
    public ResponseEntity<QuoteResponse> quote(@RequestHeader("X-User-Id") Long userId,
                                               @RequestParam Long listingId,
                                               @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(orderService.quote(userId, listingId, quantity));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@RequestHeader("X-User-Id") Long userId,
                                                @RequestHeader("X-User-Name") String username,
                                                @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(userId, username, request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> myPurchases(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(orderService.myPurchases(userId));
    }

    @GetMapping("/sales")
    public ResponseEntity<List<OrderResponse>> mySales(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(orderService.mySales(userId));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> dashboard(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(orderService.dashboard(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> findById(@RequestHeader("X-User-Id") Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(userId, id));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<OrderResponse> confirm(@RequestHeader("X-User-Id") Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.confirmReceipt(userId, id));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ReviewResponse> review(@RequestHeader("X-User-Id") Long userId,
                                                 @RequestHeader("X-User-Name") String username,
                                                 @PathVariable Long id,
                                                 @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.review(userId, username, id, request));
    }
}
