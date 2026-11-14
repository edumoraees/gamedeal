package br.edu.atitus.gamedeal.order.services;

import br.edu.atitus.gamedeal.order.dtos.*;

import java.util.List;

public interface OrderService {

    QuoteResponse quote(Long buyerId, Long listingId, int quantity);

    OrderResponse create(Long buyerId, String buyerName, CreateOrderRequest request);

    List<OrderResponse> myPurchases(Long buyerId);

    List<OrderResponse> mySales(Long sellerId);

    OrderResponse findById(Long userId, Long orderId);

    OrderResponse confirmReceipt(Long buyerId, Long orderId);

    DashboardResponse dashboard(Long userId);
}
