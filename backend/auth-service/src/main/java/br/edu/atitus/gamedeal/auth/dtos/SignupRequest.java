package br.edu.atitus.gamedeal.auth.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "Nome de usuário é obrigatório")
        @Size(min = 3, max = 40, message = "Nome de usuário deve ter entre 3 e 40 caracteres")
        @Pattern(regexp = "^[A-Za-z0-9_.]+$", message = "Use apenas letras, números, _ e .")
        String username,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, max = 72, message = "Senha deve ter entre 6 e 72 caracteres")
        String password
) {
}
