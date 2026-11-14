package br.edu.atitus.gamedeal.auth.services.impl;

import br.edu.atitus.gamedeal.auth.components.JwtService;
import br.edu.atitus.gamedeal.auth.dtos.*;
import br.edu.atitus.gamedeal.auth.entities.UserEntity;
import br.edu.atitus.gamedeal.auth.entities.UserType;
import br.edu.atitus.gamedeal.auth.exceptions.ApiException;
import br.edu.atitus.gamedeal.auth.repositories.UserRepository;
import br.edu.atitus.gamedeal.auth.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserServiceImpl(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public UserResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();
        String username = request.username().trim();

        if (repository.existsByEmailIgnoreCase(email))
            throw new ApiException(HttpStatus.CONFLICT, "Já existe uma conta com este e-mail");
        if (repository.existsByUsernameIgnoreCase(username))
            throw new ApiException(HttpStatus.CONFLICT, "Nome de usuário já está em uso");

        var user = new UserEntity();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setType(UserType.COMMON);

        var saved = repository.save(user);
        log.info("Novo usuário cadastrado id={} username={}", saved.getId(), saved.getUsername());
        return UserResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SigninResponse signin(SigninRequest request) {
        // Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails existem.
        var user = repository.findByEmailIgnoreCase(request.email().trim())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> {
                    log.warn("Tentativa de login inválida para {}", request.email());
                    return new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
                });

        String token = jwtService.generateToken(user);
        log.info("Login realizado id={}", user.getId());
        return new SigninResponse(token, "Bearer", jwtService.getExpirationMs(), UserResponse.from(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.from(getOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserResponse findPublicById(Long id) {
        return PublicUserResponse.from(getOrThrow(id));
    }

    private UserEntity getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }
}
