package br.edu.atitus.gamedeal.auth.dtos;

public record SigninResponse(String token, String tokenType, long expiresInMs, UserResponse user) {
}
