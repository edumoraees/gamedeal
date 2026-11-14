package br.edu.atitus.gamedeal.auth.dtos;

import br.edu.atitus.gamedeal.auth.entities.UserEntity;

import java.time.LocalDateTime;

/** Dados públicos do usuário. Nunca expõe a senha. */
public record UserResponse(Long id, String username, String email, String type, LocalDateTime createdAt) {

    public static UserResponse from(UserEntity user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                user.getType().name(), user.getCreatedAt());
    }
}
