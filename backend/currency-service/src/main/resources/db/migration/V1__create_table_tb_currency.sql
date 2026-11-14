-- Cotações de referência usadas como fallback quando a API do Banco Central não responde.
-- rate_to_brl = quantos reais vale 1 unidade da moeda.
CREATE TABLE tb_currency (
    code         VARCHAR(3)     PRIMARY KEY,
    name         VARCHAR(40)    NOT NULL,
    rate_to_brl  NUMERIC(12, 6) NOT NULL,
    updated_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

INSERT INTO tb_currency (code, name, rate_to_brl) VALUES
    ('BRL', 'Real brasileiro',     1.000000),
    ('USD', 'Dólar americano',     5.350000),
    ('EUR', 'Euro',                6.200000),
    ('GBP', 'Libra esterlina',     7.100000),
    ('ARS', 'Peso argentino',      0.005200);
