CREATE TABLE tb_order (
    id             BIGSERIAL      PRIMARY KEY,
    buyer_id       BIGINT         NOT NULL,
    buyer_name     VARCHAR(40)    NOT NULL,
    seller_id      BIGINT         NOT NULL,
    seller_name    VARCHAR(40)    NOT NULL,
    -- Cópia dos dados do anúncio no momento da compra (database per service: sem FK para o catálogo)
    listing_id     BIGINT         NOT NULL,
    listing_title  VARCHAR(120)   NOT NULL,
    listing_image  VARCHAR(500),
    category       VARCHAR(20)    NOT NULL,
    game_name      VARCHAR(60)    NOT NULL,
    unit_price     NUMERIC(12, 2) NOT NULL,
    quantity       INTEGER        NOT NULL CHECK (quantity > 0),
    subtotal       NUMERIC(12, 2) NOT NULL,
    service_fee    NUMERIC(12, 2) NOT NULL,   -- taxa do cofre (escrow) paga pelo comprador
    total          NUMERIC(12, 2) NOT NULL,
    seller_net     NUMERIC(12, 2) NOT NULL,   -- subtotal menos a taxa de plataforma do vendedor
    status         VARCHAR(20)    NOT NULL,   -- PAID, COMPLETED, CANCELLED
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW(),
    completed_at   TIMESTAMP
);

CREATE INDEX idx_order_buyer ON tb_order (buyer_id);
CREATE INDEX idx_order_seller ON tb_order (seller_id);

CREATE TABLE tb_review (
    id          BIGSERIAL     PRIMARY KEY,
    order_id    BIGINT        NOT NULL UNIQUE REFERENCES tb_order (id),
    seller_id   BIGINT        NOT NULL,
    buyer_id    BIGINT        NOT NULL,
    buyer_name  VARCHAR(40)   NOT NULL,
    rating      INTEGER       NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     VARCHAR(1000),
    tags        VARCHAR(300),               -- separadas por vírgula, ex.: "Entrega Rápida,Confiável"
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_seller ON tb_review (seller_id);
