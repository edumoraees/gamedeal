package br.edu.atitus.gamedeal.catalog.dtos;

import br.edu.atitus.gamedeal.catalog.entities.GameEntity;

public record GameResponse(Long id, String name, String slug) {

    public static GameResponse from(GameEntity game) {
        return new GameResponse(game.getId(), game.getName(), game.getSlug());
    }
}
