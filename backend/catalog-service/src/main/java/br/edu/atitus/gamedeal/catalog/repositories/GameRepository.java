package br.edu.atitus.gamedeal.catalog.repositories;

import br.edu.atitus.gamedeal.catalog.entities.GameEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends JpaRepository<GameEntity, Long> {
}
