package br.edu.atitus.gamedeal.auth.services;

import br.edu.atitus.gamedeal.auth.dtos.*;

public interface UserService {

    UserResponse signup(SignupRequest request);

    SigninResponse signin(SigninRequest request);

    UserResponse findById(Long id);

    PublicUserResponse findPublicById(Long id);
}
