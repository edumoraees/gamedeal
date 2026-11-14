package br.edu.atitus.gamedeal.currency.repositories;

import br.edu.atitus.gamedeal.currency.entities.CurrencyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurrencyRepository extends JpaRepository<CurrencyEntity, String> {
}
