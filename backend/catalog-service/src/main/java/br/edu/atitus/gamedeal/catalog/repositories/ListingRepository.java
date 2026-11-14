package br.edu.atitus.gamedeal.catalog.repositories;

import br.edu.atitus.gamedeal.catalog.entities.ListingCategory;
import br.edu.atitus.gamedeal.catalog.entities.ListingEntity;
import br.edu.atitus.gamedeal.catalog.entities.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<ListingEntity, Long> {

    /** Busca pública com filtros opcionais (parâmetro nulo = sem filtro). */
    @Query("""
            SELECT l FROM ListingEntity l
            WHERE l.status = :status
              AND (:category IS NULL OR l.category = :category)
              AND (:gameId IS NULL OR l.game.id = :gameId)
              AND (:sellerId IS NULL OR l.sellerId = :sellerId)
              AND (:subcategory IS NULL OR LOWER(l.subcategory) = LOWER(CAST(:subcategory AS string)))
              AND (:search IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
            """)
    Page<ListingEntity> search(@Param("status") ListingStatus status,
                               @Param("category") ListingCategory category,
                               @Param("gameId") Long gameId,
                               @Param("sellerId") Long sellerId,
                               @Param("subcategory") String subcategory,
                               @Param("search") String search,
                               Pageable pageable);

    List<ListingEntity> findBySellerIdAndStatusNotOrderByCreatedAtDesc(Long sellerId, ListingStatus status);

    /**
     * Reserva estoque de forma atômica: só atualiza se ainda houver quantidade suficiente.
     * Retorna o número de linhas alteradas (0 = sem estoque ou anúncio indisponível).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE ListingEntity l
               SET l.quantity = l.quantity - :qty,
                   l.soldCount = l.soldCount + :qty,
                   l.status = CASE WHEN l.quantity - :qty = 0 THEN :soldOut ELSE l.status END
             WHERE l.id = :id AND l.status = :active AND l.quantity >= :qty
            """)
    int reserveStock(@Param("id") Long id, @Param("qty") int qty,
                     @Param("active") ListingStatus active, @Param("soldOut") ListingStatus soldOut);

    /** Devolve estoque (compensação quando o pedido não pôde ser concluído). */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE ListingEntity l
               SET l.quantity = l.quantity + :qty,
                   l.soldCount = l.soldCount - :qty,
                   l.status = CASE WHEN l.status = :soldOut THEN :active ELSE l.status END
             WHERE l.id = :id
            """)
    int releaseStock(@Param("id") Long id, @Param("qty") int qty,
                     @Param("active") ListingStatus active, @Param("soldOut") ListingStatus soldOut);
}
