package br.edu.atitus.gamedeal.order.entities;

public enum OrderStatus {
    /** Pagamento retido no cofre (escrow) aguardando o comprador confirmar o recebimento. */
    PAID,
    /** Comprador confirmou o recebimento; valor liberado ao vendedor. */
    COMPLETED,
    CANCELLED
}
