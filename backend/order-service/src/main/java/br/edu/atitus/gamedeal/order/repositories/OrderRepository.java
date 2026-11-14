package br.edu.atitus.gamedeal.order.repositories;

import br.edu.atitus.gamedeal.order.entities.OrderEntity;
import br.edu.atitus.gamedeal.order.entities.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<OrderEntity> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    long countBySellerIdAndStatus(Long sellerId, OrderStatus status);

    long countByBuyerIdAndStatus(Long buyerId, OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.sellerNet), 0) FROM OrderEntity o WHERE o.sellerId = :sellerId AND o.status = :status")
    BigDecimal sumSellerNet(@Param("sellerId") Long sellerId, @Param("status") OrderStatus status);
}
