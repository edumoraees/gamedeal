# Endpoints da API do GameDeal

Todas as requisições passam pelo **API Gateway** em `http://localhost:8080`.

- Rotas **públicas** não exigem token.
- Rotas **protegidas** começam com `/ws/` e exigem `Authorization: Bearer <token>`.
- Erros seguem sempre o mesmo formato:

```json
{ "timestamp": "2026-11-20T10:00:00", "status": 409, "error": "Conflict",
  "message": "Estoque insuficiente para a quantidade solicitada", "path": "/ws/orders", "details": [] }
```

Para os exemplos, faça login e guarde o token:

```bash
# Linux/macOS/Git Bash
TOKEN=$(curl -s -X POST http://localhost:8080/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"lula@gamedeal.com","password":"gamedeal123"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
echo $TOKEN
```

---

## auth-service

| Método | Caminho | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/signup` | Público | Cria uma conta |
| POST | `/auth/signin` | Público | Login; devolve o JWT e os dados do usuário |
| GET | `/auth/users/{id}` | Público | Perfil público (nome e data de cadastro) |
| GET | `/ws/auth/me` | Protegido | Dados do usuário logado |

```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"novo_jogador","email":"novo@gamedeal.com","password":"senha123"}'
```

```bash
curl -X POST http://localhost:8080/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"lula@gamedeal.com","password":"gamedeal123"}'
```

```bash
curl http://localhost:8080/auth/users/2
```

```bash
curl http://localhost:8080/ws/auth/me -H "Authorization: Bearer $TOKEN"
```

---

## catalog-service

| Método | Caminho | Acesso | Descrição |
|---|---|---|---|
| GET | `/games` | Público | Lista os jogos |
| GET | `/listings` | Público | Busca anúncios ativos. Filtros: `category` (ARMA, SKIN, MOEDA, CONTA, SERVICO), `gameId`, `sellerId`, `subcategory`, `search`, `currency`, `sort` (price_asc, price_desc, popular), `page`, `size` |
| GET | `/listings/{id}` | Público | Detalhe do anúncio; `currency=USD` converte o preço via currency-service |
| GET | `/images/{arquivo}` | Público | Foto de um anúncio |
| POST | `/ws/listings` | Protegido | Cria um anúncio (o vendedor é o usuário do token) |
| GET | `/ws/listings/mine` | Protegido | Anúncios do usuário logado |
| PUT | `/ws/listings/{id}` | Protegido | Edita um anúncio próprio |
| PATCH | `/ws/listings/{id}/status` | Protegido | Pausa ou reativa (`ACTIVE` / `PAUSED`) |
| DELETE | `/ws/listings/{id}` | Protegido | Remove um anúncio (exclusão lógica) |
| POST | `/ws/listings/images` | Protegido | Upload de foto (multipart, campo `file`; JPG/PNG/WEBP até 5 MB) |

```bash
curl http://localhost:8080/games
```

```bash
curl "http://localhost:8080/listings?category=SKIN&sort=price_desc&page=0&size=10"
```

```bash
curl "http://localhost:8080/listings?category=SERVICO&subcategory=Coaching"
```

```bash
curl "http://localhost:8080/listings/1?currency=USD"
```

```bash
curl -X POST http://localhost:8080/ws/listings \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"AK-47 | Neon Rider","description":"Skin Field-Tested, sem stickers.","category":"SKIN","rarity":"RARE","gameId":1,"price":350.00,"quantity":2,"images":[]}'
```

```bash
curl http://localhost:8080/ws/listings/mine -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X PUT http://localhost:8080/ws/listings/2 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Phase Blade S3","description":"Lâmina temporada 3 com acabamento holográfico.","category":"ARMA","rarity":"EPIC","gameId":2,"price":45.90,"quantity":3,"images":[]}'
```

```bash
curl -X PATCH http://localhost:8080/ws/listings/2/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"PAUSED"}'
```

```bash
curl -X DELETE http://localhost:8080/ws/listings/2 -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST http://localhost:8080/ws/listings/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/caminho/para/foto.jpg;type=image/jpeg"
```

```bash
curl -O http://localhost:8080/images/<arquivo-devolvido-no-upload>.jpg
```

---

## order-service

| Método | Caminho | Acesso | Descrição |
|---|---|---|---|
| GET | `/ws/orders/quote` | Protegido | Resumo de valores antes de comprar (`listingId`, `quantity`) |
| POST | `/ws/orders` | Protegido | Cria o pedido: consulta e reserva o estoque no catalog-service |
| GET | `/ws/orders` | Protegido | Minhas compras |
| GET | `/ws/orders/sales` | Protegido | Minhas vendas |
| GET | `/ws/orders/dashboard` | Protegido | Números do Painel de Vendas |
| GET | `/ws/orders/{id}` | Protegido | Detalhe do pedido (comprador ou vendedor) |
| POST | `/ws/orders/{id}/confirm` | Protegido | Comprador confirma o recebimento e o valor é liberado |
| POST | `/ws/orders/{id}/review` | Protegido | Avalia o vendedor (nota, comentário e etiquetas) |
| GET | `/sellers/{id}/summary` | Público | Reputação do vendedor |
| GET | `/sellers/{id}/reviews` | Público | Últimas avaliações do vendedor |

```bash
curl "http://localhost:8080/ws/orders/quote?listingId=1&quantity=1" -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST http://localhost:8080/ws/orders \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"listingId":1,"quantity":1}'
```

```bash
curl http://localhost:8080/ws/orders -H "Authorization: Bearer $TOKEN"
```

```bash
curl http://localhost:8080/ws/orders/sales -H "Authorization: Bearer $TOKEN"
```

```bash
curl http://localhost:8080/ws/orders/dashboard -H "Authorization: Bearer $TOKEN"
```

```bash
curl http://localhost:8080/ws/orders/1 -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST http://localhost:8080/ws/orders/3/confirm -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST http://localhost:8080/ws/orders/3/review \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Entrega rápida!","tags":["Entrega Rápida","Confiável"]}'
```

```bash
curl http://localhost:8080/sellers/2/summary
```

```bash
curl http://localhost:8080/sellers/2/reviews
```

---

## currency-service

| Método | Caminho | Acesso | Descrição |
|---|---|---|---|
| GET | `/currencies` | Público | Moedas suportadas e a última cotação em reais |
| GET | `/currencies/rate` | Público | Taxa de conversão (`source`, `target`). `provider`: BCB (Banco Central), CACHE (fallback) ou SAME |

```bash
curl http://localhost:8080/currencies
```

```bash
curl "http://localhost:8080/currencies/rate?source=BRL&target=USD"
```

---

## Endpoints internos (não expostos pelo Gateway)

Usados apenas pelo `order-service`, dentro da rede Docker. Uma chamada a esses caminhos pelo Gateway retorna 404.

| Método | Caminho | Descrição |
|---|---|---|
| GET | `catalog-service /internal/listings/{id}` | Dados do anúncio para o pedido |
| POST | `catalog-service /internal/listings/{id}/reserve` | Reserva atômica de estoque |
| POST | `catalog-service /internal/listings/{id}/release` | Devolve o estoque (compensação) |

## Actuator (cada serviço, dentro da rede Docker)

`/actuator/health` (usado pelo Consul) e `/actuator/prometheus` (coletado pelo Prometheus).
