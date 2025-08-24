# API de Integrações (NestJS)

Backend em NestJS responsável por:
- Gestão de integrações e webhooks (ingestão, armazenamento e métricas).
- Dashboard com estatísticas (uso de webhooks, taxa de sucesso, últimos 7 dias, últimos registros).
- Checkout/assinaturas e usuários.
- Módulos principais: `plans`, `dashboard`, `checkout`, `integrations`, `webhooks`, `user`, `asaas`.

Tecnologias
- NestJS 11 (TypeScript)
- Mongoose 8 (MongoDB)
- Validação global com `class-validator`/`class-transformer`
- CORS habilitado
- Prefixo global de rotas: `/v1`
- Autenticação via JWT (biblioteca `@clerk/backend` presente no projeto)

Estrutura relevante
- [src/main.ts](cci:7://file:///home/edson/Documents/Integration/api/src/main.ts:0:0-0:0): configura CORS, prefixo `/v1` e validação global.
- [src/app.module.ts](cci:7://file:///home/edson/Documents/Integration/api/src/app.module.ts:0:0-0:0): carrega variáveis com `ConfigModule` e conecta ao MongoDB via `MongooseModule.forRoot(process.env.MONGODB_URI)`.
- [docker-compose.yaml](cci:7://file:///home/edson/Documents/Integration/api/docker-compose.yaml:0:0-0:0): serviço MongoDB exposto em `27017`.

Pré-requisitos
- Node.js 18+ e npm
- MongoDB 6+ (local) ou Docker
- Variáveis de ambiente definidas em um arquivo `.env` na raiz do projeto

Variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com, pelo menos:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/conectaplus
SKIP_AUTH=
ASAAS_API_KEY=
ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3
CLERK_SECRET_KEY=
API_URL=http://localhost:3000
```

Instalação
```bash
npm install
```

Subindo o MongoDB (opcional via Docker)
```bash
docker compose up -d mongodb
```

Executando a API
- Desenvolvimento (watch):
```bash
npm run start:dev
```
- Desenvolvimento (sem watch):
```bash
npm run start
```
- Produção:
```bash
npm run build
npm run start:prod
```

Acesso
- A API escuta na porta definida em `PORT` (padrão 3000).
- Prefixo global: `http://localhost:3000/v1`.

Scripts úteis
- Lint: `npm run lint`
- Format: `npm run format`
- Build: `npm run build`

Autenticação
- Verificação por JWT.
- Garanta que as requisições incluam header Authorization: `Bearer <token>`.

Notas e dicas
- Conexão MongoDB: verifique `MONGODB_URI` e se o serviço está de pé (`docker ps`).
- Validação de DTOs: com whitelist e transformação habilitadas em `ValidationPipe`.
- Prefixo `/v1`: todas as rotas da aplicação herdam esse prefixo.

Módulos principais
- `modules/dashboard`: agrega métricas (uso de webhooks, taxa de sucesso, últimos 7 dias, últimos registros).
- `modules/integrations`: gestão e contadores de sucesso/erro.
- `modules/webhooks`: ingestão/armazenamento.
- `modules/checkout` e `modules/plans`: fluxo de planos/assinaturas.
- `modules/user`: usuários e metadados (ex.: assinatura).
- `modules/asaas`: integrações de pagamento/assinatura.

## Exemplos de Requisição (payloads) e Headers

Obs.: Prefixo global: `/v1`. A menos que indicado como pública, inclua o header de autenticação.

Headers padrão (rotas protegidas)
```http
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json
```

### Integrações
- POST `/v1/integrations/user`

Body (exemplo):
```json
{
  "name": "Shopify → Notion",
  "source": { "platform": "shopify", "event": "order.created" },
  "destination": { "platform": "notion", "action": "create_page", "url": "https://api.notion.com/v1/pages", "apiKey": "<apiKey>" }
}
```

### Checkout
- POST `/v1/checkout/apply-coupon`

Body:
```json
{
  "couponCode": "PROMO10",
  "planId": "pro"
}
```

- POST `/v1/checkout/process-payment`

Body:
```json
{
  "planId": "pro",
  "couponCode": "PROMO10",
  "paymentData": {
    "cardName": "JOAO DA SILVA",
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2030",
    "cvv": "123"
  },
  "customerData": {
    "name": "João da Silva",
    "email": "joao@example.com",
    "cpfCnpj": "12345678900",
    "postalCode": "01311000",
    "addressNumber": "100",
    "phone": "11999999999"
  }
}
```

- POST `/v1/checkout/confirm-payment` (pública)
Body (exemplo mínimo esperado pelo serviço):
```json
{
  "event": "PAYMENT_CONFIRMED",
  "dateCreated": "2025-08-24 12:00:00",
  "payment": {
    "id": "pay_123",
    "subscription": "sub_abc"
  }
}
```

### Usuários
- POST `/v1/users/webhook` (pública; Clerk)

Body (exemplo `user.created` do Clerk):
```json
{
  "type": "user.created",
  "data": {
    "id": "user_2Xy...",
    "primary_email_address_id": "id_email_primary",
    "email_addresses": [
      { "id": "id_email_primary", "email_address": "user@example.com" }
    ]
  }
}