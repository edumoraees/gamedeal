package br.edu.atitus.gamedeal.auth.dtos;

import br.edu.atitus.gamedeal.auth.entities.UserEntity;

import java.time.LocalDateTime;

/** Perfil público (sem e-mail), usado ao exibir vendedores. */
public record PublicUserResponse(Long id, String username, LocalDateTime memberSince) {

    public static PublicUserResponse from(UserEntity user) {
        return new PublicUserResponse(user.getId(), user.getUsername(), user.getCreatedAt());
    }
}
