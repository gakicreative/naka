# Implementation Plan

## Task Summary

- **Feature:** white-label
- **Total:** 8 major tasks, 17 sub-tasks
- **Requirements covered:** 1.1–8.3 (todos os 8 grupos de requisitos, 26 critérios)

---

- [x] 1. Backend — Migração e Schema
- [x] 1.1 Criar arquivo de migração para adicionar `logo_url` na tabela `organizations`
  - Criar `migrations/0003_org_logo_url.sql` com `ALTER TABLE organizations ADD COLUMN logo_url TEXT`
  - Valor NULL indica sem logo configurada — sem valor padrão nem constraint de enum
  - _Requirements: 2.1_

- [x] 1.2 Atualizar o schema Drizzle para refletir a nova coluna
  - Adicionar `logoUrl: text('logo_url')` na definição da tabela `organizations` em `server/db.ts`
  - Depende da migration 1.1
  - _Requirements: 2.1_

- [x] 2. Backend — Estender GET /api/auth/me
  - Substituir a query atual (somente `users`) por uma query com join em `organizations` para obter `logo_url` e `name`
  - Incluir `orgLogoUrl` (de `organizations.logo_url`) e `orgName` (de `organizations.name`) na resposta JSON
  - Se join retornar vazio (org não encontrada), retornar `orgLogoUrl: null` e `orgName: ''` sem erro fatal
  - _Requirements: 2.3, 2.4, 4.2, 8.3_

- [x] 3. Backend — Endpoints de Gestão da Logo
- [x] 3.1 (P) Criar `PATCH /api/orgs/me` para persistir nova logo_url
  - Criar `server/routes/orgs.ts` e registrar no roteador principal
  - Extrair `orgId` e `role` do JWT via `requireAuth`; nunca do body
  - Role check: retornar 403 para roles diferentes de `admin` e `socio`
  - Validar que `logoUrl` começa com `/uploads/` antes de gravar
  - Atualizar `organizations.logo_url` com `where(eq(organizations.id, orgId))`
  - _Requirements: 1.1, 1.6, 6.1, 8.1, 8.2_

- [x] 3.2 (P) Criar `DELETE /api/orgs/me/logo` para remover logo
  - Mesmo role check de 3.1 (admin/socio); retornar 403 para outros
  - Setar `logo_url = NULL` na organização do JWT
  - _Requirements: 5.2, 5.3, 8.1, 8.2_

- [x] 4. Store — Tipos e Sessão
- [x] 4.1 (P) Adicionar `orgLogoUrl` e `orgName` à interface `UserSession`
  - Adicionar campos `orgLogoUrl?: string | null` e `orgName?: string` na interface `UserSession` em `src/store/index.ts`
  - _Requirements: 2.3, 3.3, 4.3_

- [x] 4.2 Atualizar `AppProvider` para inicializar campos de logo da organização
  - Extrair `orgLogoUrl` e `orgName` do response de `GET /api/auth/me` e incluí-los no objeto passado a `setSession`
  - Depende de 2 (endpoint estendido) e 4.1 (tipos)
  - _Requirements: 2.3, 2.4, 8.3_

- [x] 5. Componente OrgLogo
  - Criar `src/components/OrgLogo.tsx` com props `logoUrl`, `orgName`, `className`, `size` e `isLoading`
  - Quando `isLoading`: renderizar `div` com `animate-pulse`
  - Quando `logoUrl` não-nulo: renderizar `<img>` com `onError` que comuta para estado `failed`
  - Quando `logoUrl` nulo ou `failed`: exibir div com iniciais (primeiras letras de cada palavra do `orgName`, máximo 2 caracteres)
  - _Requirements: 3.3, 3.4, 3.5, 4.3, 4.4_

- [x] 6. Integração nos Componentes de Layout
- [x] 6.1 (P) Substituir logos estáticas em `Layout.tsx` pelo componente `OrgLogo`
  - Sidebar desktop: substituir `<img src="/naka-logo.svg">` por `<OrgLogo logoUrl={session?.orgLogoUrl} orgName={session?.orgName ?? ''} isLoading={!isAuthReady} />`
  - Header mobile: substituir logo estática pelo mesmo `OrgLogo`
  - Ler `session.orgLogoUrl` e `session.orgName` do store; ler `isAuthReady` do `useApp()`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6.2 (P) Integrar `OrgLogo` no `ClientPortal.tsx`
  - Substituir o placeholder hardcoded "DA" por `<OrgLogo logoUrl={session?.orgLogoUrl} orgName={session?.orgName ?? ''} />`
  - _Requirements: 4.1, 4.3, 4.4_

- [x] 7. Aba Organização em Settings
- [x] 7.1 Adicionar aba "Organização" com role guard em `Settings.tsx`
  - Adicionar `{ id: 'organization', icon: Building2, label: 'Organização', adminOrSocio: true }` ao array `tabs`
  - Filtrar a aba para exibir somente quando `session?.role === 'admin' || session?.role === 'socio'`
  - _Requirements: 7.1_

- [x] 7.2 Implementar seção de upload e preview da logo
  - Quando `session.orgLogoUrl` não-nulo: exibir thumbnail da logo + botão "Substituir" + botão "Remover"
  - Quando `session.orgLogoUrl` nulo: exibir área de seleção de arquivo com instrução de formatos e limite
  - Validar arquivo antes do envio (tipo e tamanho 5 MB); rejeitar com toast de erro descritivo
  - Fluxo: `POST /api/upload` → `PATCH /api/orgs/me` → `setSession` com novo `orgLogoUrl`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 7.2, 7.3, 7.4_

- [x] 7.3 Implementar confirmação e fluxo de remoção da logo
  - Dialog de confirmação antes de remover
  - `DELETE /api/orgs/me/logo` → `setSession` com `orgLogoUrl: null`
  - _Requirements: 5.1, 5.2, 7.4_

- [ ]* 8. Testes
- [ ]* 8.1 Testes unitários de validação e componente OrgLogo
  - `validateLogoFile`: tipo inválido, tamanho exato de 5 MB, acima do limite, combinação válida
  - `OrgLogo`: renderiza img, renderiza fallback por logoUrl nulo, renderiza fallback por onError, renderiza skeleton
  - _Requirements: 1.3, 1.4, 3.3, 3.4, 3.5_

- [ ]* 8.2 Testes de integração dos endpoints
  - `GET /api/auth/me` retorna `orgLogoUrl` e `orgName` corretos após join
  - `PATCH /api/orgs/me` persiste logo_url para admin; retorna 403 para lider
  - `DELETE /api/orgs/me/logo` seta NULL para socio; retorna 403 para seeder
  - _Requirements: 1.6, 2.3, 5.3, 8.1, 8.2, 8.3_
