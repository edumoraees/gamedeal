package br.edu.atitus.gamedeal.order.dtos;

import br.edu.atitus.gamedeal.order.entities.OrderEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        Long buyerId,
        String buyerName,
        Long sellerId,
        String sellerName,
        Long listingId,
        String listingTitle,
        String listingImage,
        String category,
        String gameName,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal subtotal,
        BigDecimal serviceFee,
        BigDecimal total,
        BigDecimal sellerNet,
        String status,
        boolean reviewed,
        LocalDateTime createdAt,
        LocalDateTime completedAt
) {
    public static OrderResponse from(OrderEntity o, boolean reviewed) {
        return new OrderResponse(o.getId(), o.getBuyerId(), o.getBuyerName(), o.getSellerId(), o.getSellerName(),
                o.getListingId(), o.getListingTitle(), o.getListingImage(), o.getCategory(), o.getGameName(),
                o.getUnitPrice(), o.getQuantity(), o.getSubtotal(), o.getServiceFee(), o.getTotal(),
                o.getSellerNet(), o.getStatus().name(), reviewed, o.getCreatedAt(), o.getCompletedAt());
    }
}
