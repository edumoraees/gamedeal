CREATE TABLE tb_user (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(40)  NOT NULL UNIQUE,
    email       VARCHAR(120) NOT NULL UNIQUE,
    password    VARCHAR(100) NOT NULL,
    type        VARCHAR(20)  NOT NULL DEFAULT 'COMMON',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
