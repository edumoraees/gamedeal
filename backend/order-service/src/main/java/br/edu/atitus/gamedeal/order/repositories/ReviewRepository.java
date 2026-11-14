package br.edu.atitus.gamedeal.order.repositories;

import br.edu.atitus.gamedeal.order.entities.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    boolean existsByOrderId(Long orderId);

    List<ReviewEntity> findTop20BySellerIdOrderByCreatedAtDesc(Long sellerId);

    long countBySellerId(Long sellerId);

    long countBySellerIdAndRatingGreaterThanEqual(Long sellerId, Integer rating);

    @Query("SELECT AVG(r.rating) FROM ReviewEntity r WHERE r.sellerId = :sellerId")
    Double averageRating(@Param("sellerId") Long sellerId);

    @Query("SELECT r.order.id FROM ReviewEntity r WHERE r.buyerId = :buyerId")
    List<Long> findReviewedOrderIdsByBuyer(@Param("buyerId") Long buyerId);
}
