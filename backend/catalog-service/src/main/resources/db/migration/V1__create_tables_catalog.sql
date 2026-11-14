CREATE TABLE tb_game (
    id     BIGSERIAL    PRIMARY KEY,
    name   VARCHAR(60)  NOT NULL UNIQUE,
    slug   VARCHAR(40)  NOT NULL UNIQUE
);

CREATE TABLE tb_listing (
    id           BIGSERIAL      PRIMARY KEY,
    seller_id    BIGINT         NOT NULL,          -- id do usuário no auth-service (sem FK: database per service)
    seller_name  VARCHAR(40)    NOT NULL,          -- cópia do nome para não depender do auth-service na listagem
    title        VARCHAR(120)   NOT NULL,
    description  VARCHAR(2000)  NOT NULL,
    category     VARCHAR(20)    NOT NULL,          -- ARMA, SKIN, MOEDA, CONTA, SERVICO
    subcategory  VARCHAR(40),                      -- ex.: Coaching, Rank Boost, Upar (para serviços)
    rarity       VARCHAR(30),                      -- ex.: LEGENDARY, RARE
    game_id      BIGINT         NOT NULL REFERENCES tb_game (id),
    price        NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    quantity     INTEGER        NOT NULL CHECK (quantity >= 0),
    sold_count   INTEGER        NOT NULL DEFAULT 0,
    status       VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, PAUSED, SOLD_OUT, REMOVED
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE tb_listing_image (
    listing_id  BIGINT        NOT NULL REFERENCES tb_listing (id) ON DELETE CASCADE,
    position    INTEGER       NOT NULL,
    url         VARCHAR(500)  NOT NULL,
    PRIMARY KEY (listing_id, position)
);

CREATE INDEX idx_listing_status_category ON tb_listing (status, category);
CREATE INDEX idx_listing_seller ON tb_listing (seller_id);
