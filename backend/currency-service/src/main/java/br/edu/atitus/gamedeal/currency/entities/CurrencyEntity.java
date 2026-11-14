package br.edu.atitus.gamedeal.currency.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_currency")
public class CurrencyEntity {

    @Id
    @Column(length = 3)
    private String code;

    @Column(nullable = false, length = 40)
    private String name;

    @Column(name = "rate_to_brl", nullable = false, precision = 12, scale = 6)
    private BigDecimal rateToBrl;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getRateToBrl() { return rateToBrl; }
    public void setRateToBrl(BigDecimal rateToBrl) { this.rateToBrl = rateToBrl; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
