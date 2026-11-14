package br.edu.atitus.gamedeal.order.dtos;

import java.math.BigDecimal;

/** Números do "Painel de Vendas" do usuário logado. */
public record DashboardResponse(long completedSales, long pendingSales, BigDecimal revenue,
                                BigDecimal pendingBalance, long completedPurchases) {
}
