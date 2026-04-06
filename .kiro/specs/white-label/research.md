# Research Log — White-Label

## Summary

**Discovery type:** Light (Extension)
**Feature:** Exibição do logotipo da organização no painel interno e no portal do cliente.
**Escopo:** Upload via endpoint R2 existente (`POST /api/upload`), persistência em `organizations.logo_url`, exibição condicional em `Layout.tsx` (sidebar) e `ClientPortal.tsx`.

**Principais conclusões:**
1. O endpoint `POST /api/upload` já valida tipo e tamanho — é reutilizável sem modificação.
2. O `GET /api/auth/me` retorna apenas dados de `users`; precisa de join com `organizations` para incluir `logo_url`.
3. A migration será `0003_org_logo_url.sql` (0000 e 0001 já existem; 0002 reservado pela feature task-views).
4. O `ClientPortal.tsx` usa o mesmo fluxo de autenticação (`AppProvider` → store), portanto não é necessário endpoint público separado: incluir `orgLogoUrl` no response de `GET /api/auth/me` é suficiente.

---

## Research Log

### Tópico 1 — Upload de arquivo (R2)

**Fonte:** `server/routes/uploads.ts`
**Investigação:**
- Endpoint `POST /api/upload` já aceita JPEG, PNG, WebP, SVG+XML, GIF, PDF com limite de 20 MB.
- Retorna `{ url: '/uploads/{uuid}.{ext}' }`.
- Requer autenticação via `requireAuth`.

**Implicação de design:** Reutilizar sem modificação. Validação de 5 MB e tipos permitidos é responsabilidade do frontend (pre-upload validation), já que o servidor aceita até 20 MB. Anotar na UI os tipos e limite corretos.

---

### Tópico 2 — Schema atual de organizations

**Fonte:** `server/db.ts`
**Investigação:**
- Tabela `organizations`: `id`, `name`, `slug`, `created_by`, `created_at` — sem campo `logo_url`.
- `migrations/0000_initial_schema.sql` e `migrations/0001_multi_tenancy.sql` já aplicadas.
- Próxima migration disponível: `0002_task_view.sql` (task-views feature) e `0003_org_logo_url.sql` (esta feature).

**Implicação de design:** Criar `migrations/0003_org_logo_url.sql` com `ALTER TABLE organizations ADD COLUMN logo_url TEXT`.

---

### Tópico 3 — GET /api/auth/me (resposta atual)

**Fonte:** `server/routes/auth.ts`, linha 235–244
**Investigação:**
- Query apenas em `users`; não há join com `organizations`.
- Resposta atual: `{ id, email, name, role, activeClientId, orgId }`.
- `PATCH /api/auth/me` já existe para `name` e `activeClientId`.

**Implicação de design:** Estender `GET /api/auth/me` com join na tabela `organizations` para retornar `orgLogoUrl` e `orgName`. Não é necessário novo endpoint público para o portal do cliente — o portal usa o mesmo JWT e o mesmo fluxo de `AppProvider`.

---

### Tópico 4 — Isolamento multi-tenant

**Fonte:** `server/auth.ts`, `server/routes/entities.ts` (padrão de org_id middleware)
**Investigação:**
- Todos os endpoints autenticados extraem `orgId` do JWT via `requireAuth`.
- `PATCH` de logo deve atualizar apenas a org do JWT — nunca aceitar `orgId` do body.
- Role check deve ser feito no handler: apenas `admin` e `socio` podem alterar logo.

**Implicação de design:** Criar `server/routes/orgs.ts` com `PATCH /api/orgs/me` e `DELETE /api/orgs/me/logo`. Role check explícito no handler com retorno 403.

---

### Tópico 5 — Layout e sidebar

**Fonte:** `src/components/Layout.tsx`, linhas 63–65
**Investigação:**
- Sidebar desktop usa `<img src="/naka-logo.svg" alt="Naka OS" className="h-6 w-auto" />`.
- Header mobile também usa `/naka-logo.svg` (linha 113).
- `useApp()` fornece `userName`, `userInitial`, `isAuthReady`.
- `useStore((s) => s.session)` fornece `role`, `orgId` — depois desta feature, fornecerá também `orgLogoUrl`.

**Implicação de design:** Criar componente `OrgLogo` reutilizável que encapsula a lógica de exibição: logo (img) → fallback de iniciais. Usar em sidebar, header mobile e portal do cliente.

---

### Tópico 6 — Settings.tsx (aba existente)

**Fonte:** `src/pages/Settings.tsx`, linha 10
**Investigação:**
- Abas atuais: `profile`, `visual`, `team`, `permissions`, `security`, `notifications`, `localization`.
- Aba `team` já tem `adminOnly: true` com filtragem por role.
- Convenção: adicionar nova aba `organization` com `adminOnly` mas permitir `socio` também (diferente da aba `team`).

**Implicação de design:** Adicionar aba `organization` com role guard `['admin', 'socio']`. Conteúdo: preview da logo atual (ou área de upload), botão de substituição e botão de remoção com confirmação.

---

## Decisões de Arquitetura

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Endpoint de upload da logo | Reutilizar `POST /api/upload` + novo `PATCH /api/orgs/me` | Evita duplicação de lógica R2 |
| Endpoint para portal do cliente | `GET /api/auth/me` com org join | Clientes já possuem JWT; endpoint público separado é desnecessário |
| Onde persistir logo | `organizations.logo_url` | Correto conceitualmente; isolamento por org_id garantido |
| Validação de arquivo | Frontend (tipo + tamanho 5 MB) | Servidor aceita 20 MB; frontend restringe ao contexto de logo |
| Componente de exibição | `OrgLogo` reutilizável | Sidebar, header mobile e portal usam o mesmo comportamento de fallback |
| Remoção da logo | `DELETE /api/orgs/me/logo` separado | Semântica clara; evita ambiguidade em PATCH com null |
