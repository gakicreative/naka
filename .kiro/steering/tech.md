# Technology Stack

## Architecture

Monolito full-stack em um único Cloudflare Worker: o mesmo binário serve a API (Hono), os assets estáticos (React SPA) e os uploads (R2). Não há servidor dedicado — tudo roda no edge da Cloudflare.

```
Browser → Cloudflare Worker
           ├── /api/*      → Hono routes (D1 database)
           ├── /uploads/*  → R2 object storage
           └── /*          → React SPA (ASSETS binding)
```

## Core Technologies

- **Language**: TypeScript (frontend + backend compartilham o mesmo repo)
- **Frontend**: React 19, React Router v7, Vite 6, Tailwind CSS v4
- **Backend**: Hono 4 (framework leve para Workers), Drizzle ORM
- **Runtime**: Cloudflare Workers (edge, sem Node.js em produção)
- **Database**: Cloudflare D1 (SQLite gerenciado)
- **Storage**: Cloudflare R2 (object storage, S3-compatible)
- **Auth**: JWT (HS256) em cookie httpOnly + Google OAuth 2.0
- **State**: Zustand com `persist` (apenas language e readNotificationIds persistidos)

## Key Libraries

- `hono/jwt`, `hono/cookie`: auth no Worker
- `bcryptjs`: hash de senhas
- `drizzle-orm/d1`: ORM para D1
- `i18next` + `react-i18next`: i18n (pt-BR / en-US)
- `motion`: animações
- `recharts`: gráficos de finanças
- `sonner`: toast notifications
- `next-themes`: dark/light mode
- `vite-plugin-pwa`: PWA + Service Worker

## UI Component Library

**shadcn/ui** + **shadcnblocks.com** são o padrão de componentes de UI do projeto.

- `components.json` configurado: `style: default`, `tsx: true`, Tailwind v4, aliases em `@/src/components/ui`
- Instalar componentes via CLI: `npx shadcn@latest add [component]`
- Blocos prontos: usar shadcnblocks.com como fonte primária de layouts e composições
- **Camada de compatibilidade**: `src/index.css` mapeia os tokens Material You do projeto (`--on-surface`, `--surface-container-*`, etc.) para os tokens shadcn (`--foreground`, `--card`, `--muted`, etc.) — componentes shadcn funcionam sem modificação
- **Tokens do projeto têm prioridade**: ao customizar componentes shadcn, usar sempre as classes Tailwind derivadas dos tokens do projeto (`bg-surface-container-low`, `text-on-surface`, etc.) em vez dos tokens shadcn genéricos

## Development Standards

### TypeScript
- TypeScript em todo o código (frontend e backend)
- Tipos explícitos para payloads de API e schemas do banco
- `any` evitado; usado apenas no mapeamento genérico de tabelas (`TABLES`)

### Naming
- Componentes React: PascalCase (`ClientDetail.tsx`)
- Rotas/arquivos: camelCase ou kebab-case
- Variáveis/funções: camelCase
- Tabelas D1: snake_case (`org_id`, `created_at`)
- Campos Drizzle/TS: camelCase (`orgId`, `createdAt`)

### API Pattern
Todos os endpoints requerem `requireAuth` middleware (exceto `/check/:id` de invites).
Respostas de erro: `{ error: string }`. Respostas de sucesso: dados diretos ou `{ ok: true }`.

## Development Environment

### Required Tools
- Node.js 20+
- Wrangler CLI 3+ (`npx wrangler`)
- Cloudflare account com D1 e R2 configurados

### Common Commands
```bash
# Dev completo (frontend + worker):
npm run dev:full

# Só frontend (mock mode sem API):
VITE_MOCK_MODE=true npm run dev

# Só worker (API):
npm run dev:worker

# Build + deploy:
npm run build && npm run deploy

# Migrations locais:
npx wrangler d1 execute nakaosdb --local --file=migrations/0001_*.sql

# Migrations produção:
npx wrangler d1 execute nakaosdb --remote --file=migrations/0001_*.sql
```

### Secrets locais
Arquivo `.dev.vars` (não commitado):
```
JWT_SECRET="..."
GOOGLE_CLIENT_SECRET="..."
```

## Key Technical Decisions

### Generic Entity Pattern
Tabelas de entidade (`clients`, `projects`, `tasks`, etc.) usam `{ id, org_id, payload: JSON }`. Isso permite evolução do schema sem migrations para mudanças no modelo de negócio — apenas a estrutura do JSON muda.

### Multi-tenancy via `org_id`
Toda entidade carrega `org_id`. O middleware injeta o `orgId` do JWT no contexto, e todas as queries filtram por ele. Isolamento garantido no servidor, não no cliente.

### JWT inclui `orgId`
`{ userId, role, orgId, exp }` — evita lookup extra no banco a cada request.

### Sem ORM migrations automáticas
Migrations são arquivos `.sql` manuais em `migrations/` executados via Wrangler CLI. Drizzle é usado apenas para queries tipadas, não para geração de schema.

---
_Stack escolhida para máximo aproveitamento do free tier da Cloudflare e zero custo de servidor_
