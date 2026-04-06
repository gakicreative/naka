# Implementation Plan — Naka OS

## Task Summary
- **Total**: 12 major tasks, 42 sub-tasks
- **Requisitos cobertos**: 1–15 (todos)
- **Tamanho médio por sub-task**: 1–3 horas
- **Paralelo**: tarefas marcadas com `(P)` podem ser executadas em paralelo após dependências resolvidas

---

- [ ] 1. Configurar schema do banco de dados
- [ ] 1.1 Criar tabelas estruturadas — users, organizations e invitations
  - Definir colunas explícitas com tipos corretos para SQLite (TEXT, INTEGER)
  - Incluir `org_id` em users e invitations como chave discriminadora de tenant
  - Garantir unicidade de `email` em users e `slug` em organizations
  - _Requirements: 3.1_

- [ ] 1.2 Criar tabelas de entidade com padrão payload JSON
  - Criar as 9 tabelas (clients, projects, tasks, transactions, brandhubs, pins, labels, notifications, feedbacks)
  - Cada tabela com colunas `id`, `org_id` e `payload` (JSON serializado)
  - `org_id` como coluna explícita para permitir filtragem sem json_extract
  - _Requirements: 3.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 14.1_

- [ ] 1.3 Escrever migrations SQL e configurar Drizzle ORM
  - Criar arquivo `migrations/0000_initial_schema.sql` para setup local
  - Criar arquivo `migrations/0001_multi_tenancy.sql` para banco existente
  - Configurar schemas Drizzle com tipagem forte para todas as tabelas
  - Documentar comandos de execução para ambiente local e produção
  - _Requirements: 3.1_

---

- [ ] 2. Implementar autenticação JWT e middleware
- [ ] 2.1 Criar middleware de autenticação com suporte a orgId
  - Extrair e verificar JWT do cookie `naka_token` usando HS256
  - Injetar `userId`, `userRole` e `orgId` no contexto Hono após verificação
  - Retornar 401 para token ausente ou inválido
  - Definir `orgId = ''` para tokens legados sem o campo
  - _Requirements: 1.7, 3.2, 4.4_

- [ ] 2.2 Implementar geração e rotação de cookies de sessão
  - Criar função `setToken` que assina JWT com payload `{ userId, role, orgId, exp }`
  - Definir cookie httpOnly, Secure, SameSite=None com TTL de 30 dias
  - Criar função `clearToken` para logout
  - _Requirements: 1.1, 1.6_

---

- [ ] 3. Implementar fluxo de autenticação por email e senha
- [ ] 3.1 Criar endpoint de login com validação bcrypt
  - Buscar usuário por email (case-insensitive)
  - Rejeitar login com mensagem genérica se email ou senha incorretos
  - Detectar conta Google-only e orientar uso do OAuth
  - Auto-criar organização para usuários legados sem `orgId`
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3.2 Criar endpoint de registro com lógica de organização
  - Primeiro usuário ou email admin: criar usuário com role `admin` e nova organização
  - Usuário com convite válido: ingressar na organização do convite com role do convite
  - Usuário sem convite e não-admin: rejeitar com 400
  - Marcar convite como utilizado após registro bem-sucedido
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3.3 Implementar endpoints de perfil autenticado
  - `GET /api/auth/me`: retornar perfil com `orgId` incluído
  - `PATCH /api/auth/me`: atualizar nome e `activeClientId`
  - `POST /api/auth/logout`: remover cookie de sessão
  - _Requirements: 1.6, 15.1_

---

- [ ] 4. Implementar autenticação Google OAuth
- [ ] 4.1 Criar fluxo de redirect para consentimento Google
  - Gerar URL OAuth com `prompt=select_account` e parâmetros obrigatórios
  - Codificar `inviteId` no parâmetro `state` em base64 para novos usuários
  - Retornar erro configurável se `GOOGLE_CLIENT_ID` não estiver definido
  - _Requirements: 1.4_

- [ ] 4.2 Implementar callback OAuth com criação e vínculo de conta
  - Trocar código de autorização por `access_token` via Google Token API
  - Buscar perfil do usuário via Google UserInfo API
  - Vincular `google_id` a conta existente se email já cadastrado
  - Criar nova conta com org própria (admin) ou via convite (demais roles)
  - Auto-criar org para usuários legados que fazem login pela primeira vez
  - _Requirements: 1.4, 1.5, 2.3_

---

- [ ] 5. Implementar sistema de convites (P)
- [ ] 5.1 Criar endpoints de gerenciamento de convites
  - `POST /api/invitations`: admin cria convite com `orgId` automático e role validada
  - `GET /api/invitations`: listar apenas convites da organização do admin
  - `DELETE /api/invitations/:id`: cancelar convite não-utilizado
  - Validar roles permitidas: `socio`, `lider`, `seeder`, `cliente`
  - _Requirements: 2.5, 2.6, 2.7, 2.8_

- [ ] 5.2 Criar endpoint público de validação de convite
  - `GET /api/invitations/check/:id`: sem autenticação, retorna `{ id, role, valid }`
  - Retornar 404 para convite inexistente e 410 para convite já utilizado
  - _Requirements: 2.4_

---

- [ ] 6. Implementar CRUD genérico de entidades com isolamento por org (P)
- [ ] 6.1 Criar rota genérica de listagem e criação por coleção
  - `GET /api/:collection`: retornar apenas registros onde `org_id = orgId` do JWT
  - `POST /api/:collection`: injetar `org_id` automaticamente no insert (nunca do payload)
  - Retornar 404 para coleção inexistente
  - _Requirements: 3.2, 3.3, 5–10, 14_

- [ ] 6.2 Criar rota de atualização e deleção com verificação de propriedade
  - `PATCH /api/:collection/:id`: verificar `org_id` antes de atualizar; mesclar payload superficialmente
  - `DELETE /api/:collection/:id`: verificar `org_id` antes de deletar; retornar 404 se não pertence à org
  - Garantir que nenhuma operação afeta registros de outra organização
  - _Requirements: 3.4_

---

- [ ] 7. Implementar upload de arquivos para R2 (P)
  - Validar tipo MIME contra lista permitida: JPEG, PNG, GIF, WebP, SVG, PDF
  - Rejeitar arquivos maiores que 20MB com HTTP 400
  - Armazenar no R2 com chave `{uuid}.{ext}` e retornar URL relativa `/uploads/{key}`
  - Exigir autenticação via `requireAuth` antes do upload
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

---

- [ ] 8. Implementar gestão de equipe (P)
  - `GET /api/team`: listar membros com role ≠ `cliente` da mesma organização
  - `PATCH /api/team/:id`: atribuir ou remover `leaderId` de membro da mesma org
  - Restringir acesso a roles `admin`, `socio` e `lider`
  - _Requirements: 12.1, 12.2, 12.3_

---

- [ ] 9. Implementar store global do frontend e camada de API
- [ ] 9.1 Criar helper de fetch autenticado e tipos de sessão
  - Implementar função `api(method, path, body?)` com `credentials: 'include'`
  - Definir tipo `UserSession` com campos `role`, `name`, `email`, `orgId`, `activeClientId`
  - Configurar suporte a MOCK mode via variável de ambiente `VITE_MOCK_MODE`
  - _Requirements: 1.7, 3.2_

- [ ] 9.2 Criar store Zustand com ações de entidades
  - Implementar ações de CRUD para clients, projects, tasks, transactions, brandhubs, pins, labels
  - Padrão de ação: chamar API → atualizar estado local (optimistic update)
  - Implementar upsert de BrandHub via try PATCH → catch → POST
  - _Requirements: 5, 6, 7, 8, 9, 10_

- [ ] 9.3 Implementar persistência seletiva e estado de sessão
  - Persistir apenas `language` e `readNotificationIds` no localStorage via middleware `persist`
  - Implementar `setSession`, `setLanguage` e ações de notificação no store
  - Implementar `updateTeamUser` para atualização de `leaderId` via API
  - _Requirements: 12, 14, 15.2_

---

- [ ] 10. Implementar roteamento e carregamento inicial no frontend
- [ ] 10.1 Criar AppProvider com carregamento paralelo de dados
  - Chamar `GET /api/auth/me` para restaurar sessão ao inicializar
  - Fazer fetch paralelo com `Promise.all` de todas as coleções após autenticação
  - Redirecionar para `/login` se sessão inválida
  - _Requirements: 1, 4_

- [ ] 10.2 Configurar roteamento com guards de role
  - Redirecionar role `cliente` de `/` para `/portal`
  - Redirecionar roles internas de `/portal` para `/`
  - Proteger todas as rotas internas contra acesso não autenticado
  - _Requirements: 4.3, 11.1, 11.4_

- [ ] 10.3 Implementar telas de login e registro
  - Login: formulário email/senha + botão Google OAuth com suporte a `inviteId` via query param
  - Registro: validar convite antes de exibir formulário; exibir role concedida
  - Exibir erros de API com feedback visual (toast)
  - _Requirements: 1.1, 1.4, 2.2, 2.3_

---

- [ ] 11. Implementar funcionalidades de gestão de estúdio
- [ ] 11.1 (P) Implementar gestão completa de clientes
  - Formulário de criação e edição com todos os campos: nome, indústria, status, logo, contatos
  - Suporte a retainer (valor, horas, renovação, health score) e contrato (datas, valor, documento)
  - Suporte a faturas, objetivos, documentos de marketing, estratégia e dados legais
  - Listagem com filtros por status e busca por nome
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [ ] 11.2 (P) Implementar gestão de projetos
  - Formulário com nome, status (`Ativo`/`Pausado`/`Concluído`), estágio e progresso percentual
  - Associação opcional a cliente; suporte a membros, objetivos e documentos de projeto
  - Listagem com filtros por status e cliente
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 11.3 (P) Implementar quadro Kanban de tarefas
  - Quadro com 5 colunas de status: `todo`, `in-progress`, `review`, `done`, `archived`
  - Card de tarefa com prioridade, responsáveis, checklist, comentários, anexos e specs criativas
  - Suporte a labels configuráveis por organização; associação a projeto e cliente
  - Arrastar e soltar entre colunas com persistência via API
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.10_

- [ ] 11.4 (P) Implementar gestão financeira
  - Formulário de transação com tipo (receita/despesa), valor, data, categoria e status
  - Listagem com filtros por mês e categoria; resumos de receitas, despesas e saldo
  - Gráfico de tendência dos últimos 6 meses com Recharts
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11.5 (P) Implementar Brand Hub de identidade visual
  - Editor de paleta de cores com hex, nome e propósito
  - Gerenciador de fontes (Google, arquivo ou link) e logos (tipo + fundo recomendado)
  - Seção de keywords, links de redes sociais, link Figma e moodboard
  - Upsert automático: atualiza se existir, cria se não existir
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 11.6 (P) Implementar feedback visual com Pins
  - Permitir adicionar pins com coordenadas x/y sobre imagens de tarefas
  - Exibir comentário, autor e timestamp por pin; marcar como resolvido
  - Filtrar pins por tarefa e org do usuário
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

---

- [ ] 12. Implementar portal do cliente e notificações
- [ ] 12.1 Implementar portal read-only para clientes
  - Exibir apenas tarefas com status `done` e `review` do cliente logado
  - Formulário de feedback com rating 1–5 e comentário para tarefas `done`
  - Bloquear acesso a qualquer rota interna para role `cliente`
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 7.9_

- [ ] 12.2 (P) Implementar sistema de notificações
  - Listar notificações da org com estado read/unread e contador no header
  - Marcar como lida individualmente e limpar todas com confirmação
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 12.3 (P) Implementar internacionalização e alternância de tema
  - Configurar i18next com pt-BR e en-US; troca dinâmica sem reload
  - Persistir preferência de idioma no localStorage via store
  - Toggle de tema claro/escuro com next-themes; configuração do service worker PWA
  - _Requirements: 15.1, 15.2, 15.3, 15.4_
