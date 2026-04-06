# Research & Design Decisions

---
**Feature**: naka-os
**Discovery Scope**: Extensão (sistema existente e funcional sendo documentado)
**Key Findings**:
- A arquitetura monolítica em Cloudflare Workers é adequada para o estágio atual e não requer servidores separados
- O padrão de payload JSON genérico (`{ id, org_id, payload }`) permite evolução de schema sem migrations para mudanças de negócio
- O `orgId` no JWT elimina lookup de banco em cada request, compensando a ausência de sessões server-side
---

## Research Log

### Arquitetura Edge vs. Serverless Tradicional

- **Context**: Escolha de runtime para backend sem custo de servidor
- **Findings**:
  - Cloudflare Workers executa em V8 isolates no edge, com cold start ~0ms
  - D1 é SQLite gerenciado pela Cloudflare com replicação global eventual
  - R2 é compatível com S3 e sem custo de egress
  - Hono é o framework mais leve e performático para Workers (zero deps, ~12kb)
- **Implications**: Stack ideal para estágio MVP sem budget de infraestrutura; trade-off é ausência de runtime Node.js (sem acesso a `fs`, `crypto` nativo — usa Web Crypto API)

### Estratégia de Multi-Tenancy

- **Context**: Precisamos isolar dados de diferentes estúdios na mesma instância D1
- **Findings**:
  - Opção A: Banco separado por org — impossível em D1 (uma instância por binding)
  - Opção B: Schema separado por org — SQLite não suporta múltiplos schemas
  - Opção C: `org_id` como coluna discriminadora em cada tabela — padrão adotado
- **Implications**: Toda query de listagem usa `WHERE org_id = ?`; o orgId vem do JWT, não do payload do cliente

### Padrão de Payload JSON vs. Schema Relacional

- **Context**: Modelar entidades de negócio com alta variabilidade de campos
- **Findings**:
  - Schema relacional com colunas explícitas requer migration para cada novo campo
  - Payload JSON permite evoluir campos de negócio sem alterar D1 schema
  - SQLite suporta `json_extract()` para queries em campos JSON, se necessário
  - Drizzle suporta `mode: 'json'` com serialização automática
- **Selected**: Coluna `org_id` explícita (discriminadora, indexável) + `payload JSON` (dados de negócio)

### Autenticação JWT vs. Sessions

- **Context**: Workers não têm acesso a Redis ou store de sessão compartilhado
- **Findings**:
  - JWT stateless é a única opção prática em Workers (sem Redis, sem sessão persistida)
  - Cookie httpOnly + SameSite=None permite cross-domain (Pages origin ↔ Worker origin)
  - `orgId` no JWT evita lookup extra por request; trade-off: mudança de org requer novo login
  - TTL de 30 dias é aceitável para MVP; rotação de token pode ser adicionada depois

### Google OAuth em Workers

- **Context**: Implementar OAuth sem library que depende de Node.js
- **Findings**:
  - Hono não tem library OAuth nativa, mas Workers têm `fetch` global
  - Fluxo manual: redirect → code exchange → userinfo — funciona perfeitamente
  - `state` parameter codificado em base64 carrega o `inviteId` para novos usuários

---

## Architecture Pattern Evaluation

| Opção | Descrição | Forças | Riscos |
|-------|-----------|--------|--------|
| Monolito no Worker | 1 Worker serve API + SPA + uploads | Zero infra, deploy simples, sem CORS issues internos | Limite de 1MB de script (mitigável com bundle splitting) |
| Worker + Pages separados | Frontend no Pages, API no Worker | CDN nativo para frontend | Cross-origin cookies requerem SameSite=None; deploy duplo |
| Microservices Workers | 1 Worker por domínio | Isolamento máximo | Overhead operacional excessivo para MVP |

**Selecionado**: Monolito no Worker com SPA fallback. Frontend é servido via `ASSETS` binding no mesmo Worker.

---

## Design Decisions

### Decision: Generic Entity Route com Tabela Dinâmica

- **Context**: 9 entidades com operações CRUD idênticas
- **Alternatives Considered**:
  1. Rota dedicada por entidade — verboso, mas explícito
  2. Rota genérica com mapa de tabelas — DRY, mas menos tipado
- **Selected Approach**: Rota genérica `/api/:collection` com `TABLES` map
- **Rationale**: Elimina código repetitivo; todas as entidades seguem o mesmo padrão
- **Trade-offs**: Validação de schema por entidade não é feita no servidor (responsabilidade do cliente)
- **Follow-up**: Adicionar validação de schema por coleção quando necessário

### Decision: orgId Armazenado no JWT

- **Context**: Toda query precisa filtrar por org; não há session store
- **Alternatives**:
  1. Lookup do org_id no banco a cada request — latência extra, mas sempre fresco
  2. orgId no JWT — zero latência extra, mas requer re-login se org mudar
- **Selected**: orgId no JWT
- **Rationale**: Workers são stateless; performance é prioridade; troca de org não é caso de uso atual

### Decision: Upsert via try/catch em BrandHub

- **Context**: BrandHub tem cardinalidade 1:1 com cliente ou projeto
- **Selected**: Tentar PATCH primeiro; se falhar (404), fazer POST
- **Rationale**: Simplifica o cliente sem precisar de endpoint dedicado de upsert
- **Follow-up**: Pode ser substituído por `INSERT OR REPLACE` em SQL quando necessário

---

## Risks & Mitigations

- **D1 eventual consistency em leituras globais** — Mitigação: para MVP a consistência é suficiente; adicionar `--prefer-region` quando D1 suportar
- **Bundle size limit de 1MB do Worker** — Mitigação: monitorar com `wrangler deploy --dry-run`; separar chunks se necessário
- **JWT sem rotação** — Mitigação: TTL de 30 dias é aceitável; adicionar refresh token quando necessário para SaaS
- **Sem índice em `org_id` por padrão em SQLite** — Mitigação: adicionar `CREATE INDEX` nas migrations se performance degradar com volume

---

## References

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/) — limitações e padrões
- [Hono Documentation](https://hono.dev/) — roteamento e middleware
- [Drizzle ORM D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new) — integração com Workers
- [EARS Format](https://ear.io/) — sintaxe de requirements
