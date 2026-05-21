# FURY Webhook — Takedown Queue
# projeto para o processo seletivo, como eu nao tenho o acesso real do negocio do meta api, entao nao sei
# como ele vai se comportar no ambiente real, mas os testes até o momento demonstram que está funcionando
#

Mini-API em Node.js + TypeScript que recebe notificações de violação de anúncios, valida o payload, enfileira jobs de takedown via BullMQ e expõe um endpoint de consulta de status.

## Tecnologias

- Node.js + TypeScript
- Express
- Zod (validação)
- BullMQ + Redis (fila)
- Axios (chamada HTTP)
- Docker (Redis)

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose

### Instalação

```bash
git clone <url-do-repo>
cd fury
npm install
```

### Subir o Redis

```bash
docker-compose up -d
```

### Rodar o servidor e o worker

Em terminais separados:

```bash
# Terminal 1 - Servidor
npm run dev

# Terminal 2 - Worker
npm run dev:worker
```

## Endpoints

### POST /webhook/violation

Recebe uma notificação de violação e enfileira um job de takedown.

**Payload:**
```json
{
  "adId": "ad-001",
  "tenantId": "tenant-abc",
  "violationType": "PROHIBITED_TERM",
  "severity": "HIGH",
  "detectedAt": "2024-01-15T10:30:00Z"
}
```

**Resposta 202:**
```json
{ "jobId": "tenant-abc-ad-001" }
```

**Resposta 400 (payload inválido):**
```json
{
  "error": "Payload inválido",
  "details": { "fieldErrors": { "adId": ["Too small: expected string to have >=1 characters"] } }
}
```

### GET /jobs/:id

Retorna o status atual do job na fila.

**Resposta 200:**
```json
{
  "jobId": "tenant-abc-ad-001",
  "status": "completed",
  "attempts": 1,
  "result": { "success": true, "statusCode": 200 },
  "error": null
}
```

## Decisões técnicas

- **Idempotência:** o jobId é gerado como `tenantId-adId`. Antes de enfileirar, verifica se já existe um job ativo com esse ID.
- **Retry:** configurado com backoff exponencial, máximo 3 tentativas (1s, 2s, 4s).
- **Simulação da Meta API:** utiliza JSONPlaceholder como endpoint substituto conforme especificado no desafio.
