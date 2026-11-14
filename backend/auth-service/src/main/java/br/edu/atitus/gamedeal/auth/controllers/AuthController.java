package br.edu.atitus.gamedeal.auth.controllers;

import br.edu.atitus.gamedeal.auth.dtos.*;
import br.edu.atitus.gamedeal.auth.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // ---------- Rotas públicas ----------

    @PostMapping("/auth/signup")
    public ResponseEntity<UserResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.signup(request));
    }

    @PostMapping("/auth/signin")
    public ResponseEntity<SigninResponse> signin(@Valid @RequestBody SigninRequest request) {
        return ResponseEntity.ok(userService.signin(request));
    }

    @GetMapping("/auth/users/{id}")
    public ResponseEntity<PublicUserResponse> publicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findPublicById(id));
    }

    // ---------- Rotas protegidas (o Gateway valida o JWT e envia X-User-Id) ----------

    @GetMapping("/ws/auth/me")
    public ResponseEntity<UserResponse> me(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.findById(userId));
    }
}
