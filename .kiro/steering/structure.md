# Project Structure

## Organization Philosophy

Feature-first no frontend, camadas no backend. O frontend organiza código por funcionalidade (páginas + componentes por domínio). O backend organiza por camada (routes, auth, db).

## Directory Patterns

### Frontend — Pages
**Location**: `src/pages/`
**Purpose**: Uma página por feature principal do produto
**Pattern**: Componente de página que usa `useStore()` diretamente
**Example**: `ClientDetail.tsx`, `KanbanBoard.tsx`, `Finances.tsx`

### Frontend — Components
**Location**: `src/components/`
**Purpose**: Componentes reutilizáveis e modais
**Subpatterns**:
- `src/components/modals/` — modais de criação/edição (ex: `NewTaskModal.tsx`)
- `src/components/ui/` — primitivos de UI sem lógica de negócio
- `src/components/AppProvider.tsx` — carrega dados da API e inicializa o store

### Frontend — State
**Location**: `src/store/index.ts`
**Purpose**: Store global único (Zustand). Contém tipos TypeScript, estado e actions
**Pattern**: Actions fazem `api()` call e depois `set()` no estado local — otimistic update
**Persistência**: Apenas `language` e `readNotificationIds` são persistidos no localStorage

```typescript
// Padrão de action no store
addClient: async (client) => {
  const id = genId();
  const newClient = { ...client, id };
  if (MOCK) { set(s => ({ clients: [...s.clients, newClient] })); return; }
  await api('POST', '/api/clients', newClient);
  set(s => ({ clients: [...s.clients, newClient] }));
},
```

### Backend — Routes
**Location**: `server/routes/`
**Purpose**: Um arquivo por domínio de rota
**Pattern**: Router Hono exportado e montado em `server/index.ts`
**Example**: `auth.ts`, `entities.ts`, `invitations.ts`, `team.ts`, `uploads.ts`

### Backend — Database
**Location**: `server/db.ts`
**Purpose**: Schema Drizzle + factory `getDb(d1)`
**Pattern**: Entity tables seguem `{ id, org_id, payload: JSON }`. Tabelas estruturadas (`users`, `organizations`, `invitations`) têm colunas explícitas.

### Backend — Migrations
**Location**: `migrations/`
**Purpose**: Arquivos SQL manuais executados via Wrangler
**Naming**: `NNNN_descricao.sql` (ex: `0001_multi_tenancy.sql`)

## Naming Conventions

- **Páginas React**: PascalCase (`ClientDetail.tsx`, `KanbanBoard.tsx`)
- **Componentes**: PascalCase (`AppProvider.tsx`, `NewTaskModal.tsx`)
- **Rotas de servidor**: camelCase (`auth.ts`, `entities.ts`)
- **Colunas D1**: snake_case (`org_id`, `created_at`, `password_hash`)
- **Campos TypeScript/Drizzle**: camelCase (`orgId`, `createdAt`, `passwordHash`)
- **Migrations**: `NNNN_kebab-case.sql`

## Import Organization

```typescript
// 1. Libs externas
import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';

// 2. Módulos internos do servidor
import { getDb, clients } from '../db.js';
import { requireAuth } from '../auth.js';
import type { Env } from '../types.js';
```

> **Nota**: imports no Worker usam extensão `.js` (ESM puro, não transpilado para CJS)

## Code Organization Principles

### Mock Mode (frontend)
`VITE_MOCK_MODE=true` faz todas as actions do store retornarem sem chamar a API. Útil para desenvolver UI sem o worker rodando.

### Env e Bindings
Variáveis de ambiente ficam em `wrangler.toml` (não-secretas) ou `.dev.vars` / Cloudflare Secrets (secretas). Nunca em `.env` no frontend.

### SPA Fallback
`server/index.ts` serve `c.env.ASSETS.fetch(c.req.raw)` para qualquer rota que não seja `/api/*` ou `/uploads/*`. O React Router cuida do roteamento client-side.

---
_Padrão genérico de entidade permite adicionar novos domínios de negócio sem migrations de schema_
