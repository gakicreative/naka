# Requirements Document

## Introduction

Naka OS é um Sistema Operacional para Estúdios Criativos — uma plataforma SaaS de gestão all-in-one para agências e estúdios de design/marketing. Permite que estúdios gerenciem clientes, projetos, tarefas, finanças e identidade de marca em um único lugar, com hierarquia de acesso por roles, portal do cliente, e isolamento total de dados por organização (multi-tenancy).

**Sistema**: Naka OS
**Usuários-alvo**: Admins, sócios, líderes e seeders de estúdios criativos; clientes externos
**Estado atual**: Aplicação funcional com multi-tenancy implementado. Billing/Stripe ainda não implementado.

---

## Requirements

### Requirement 1: Autenticação

**Objetivo:** Como usuário, quero me autenticar de forma segura para acessar o sistema com minhas permissões corretas.

#### Acceptance Criteria

1. When um usuário envia email e senha válidos via `POST /api/auth/login`, the Naka OS shall retornar o perfil do usuário com `id`, `email`, `name`, `role`, `orgId` e definir um cookie httpOnly com JWT válido por 30 dias.
2. If o email não existir ou a senha estiver incorreta, the Naka OS shall retornar HTTP 401 com mensagem de erro genérica sem revelar qual campo está errado.
3. If a conta foi criada via Google OAuth e não possui senha cadastrada, the Naka OS shall retornar HTTP 401 orientando o usuário a usar o login com Google.
4. When um usuário clica em "Entrar com Google", the Naka OS shall redirecionar para o fluxo OAuth do Google com `prompt=select_account`.
5. When o Google retorna um usuário existente (por `google_id` ou por email), the Naka OS shall vincular a conta e fazer login sem criar duplicata.
6. When o usuário faz logout via `POST /api/auth/logout`, the Naka OS shall remover o cookie de autenticação e encerrar a sessão.
7. The Naka OS shall incluir `orgId` no payload do JWT para que todas as requisições subsequentes tenham contexto de organização sem lookup adicional no banco.

---

### Requirement 2: Cadastro e Convites

**Objetivo:** Como admin, quero controlar quem entra na organização via convites para garantir que apenas pessoas autorizadas acessem os dados do estúdio.

#### Acceptance Criteria

1. When o primeiro usuário se cadastra (banco vazio) ou quando o email corresponde ao `ADMIN_EMAIL` configurado, the Naka OS shall criar o usuário com role `admin` e criar automaticamente uma nova organização com nome derivado do nome do usuário.
2. When um novo usuário tenta se cadastrar sem convite e não é o primeiro, the Naka OS shall retornar HTTP 400 com mensagem "Convite necessário para cadastro".
3. When um usuário se cadastra com um `inviteId` válido e não utilizado, the Naka OS shall criar o usuário com a role definida no convite, associar à organização do convite, e marcar o convite como utilizado.
4. If o convite não existir ou já estiver utilizado, the Naka OS shall retornar HTTP 400 rejeitando o cadastro.
5. When um admin cria um convite via `POST /api/invitations`, the Naka OS shall gerar um ID único, associar ao `orgId` do admin, e retornar o convite criado.
6. The Naka OS shall permitir apenas roles válidas em convites: `socio`, `lider`, `seeder`, `cliente`.
7. When um admin cancela um convite via `DELETE /api/invitations/:id`, the Naka OS shall deletar o convite apenas se ele ainda não tiver sido utilizado.
8. The Naka OS shall exibir apenas os convites da organização do admin logado.

---

### Requirement 3: Multi-tenancy e Isolamento de Dados

**Objetivo:** Como admin de um estúdio, quero que todos os dados da minha organização sejam completamente isolados de outras organizações para garantir privacidade e segurança.

#### Acceptance Criteria

1. The Naka OS shall armazenar `org_id` em todas as entidades (clientes, projetos, tarefas, transações, brand hubs, pins, labels, notificações, feedbacks).
2. When qualquer endpoint de listagem (`GET /api/:collection`) é chamado, the Naka OS shall retornar apenas registros com `org_id` igual ao `orgId` do JWT do usuário autenticado.
3. When um novo registro é criado via `POST /api/:collection`, the Naka OS shall persistir automaticamente o `org_id` do usuário autenticado, sem aceitar `org_id` do payload do cliente.
4. When uma atualização (`PATCH`) ou deleção (`DELETE`) é solicitada, the Naka OS shall verificar que o registro pertence à organização do usuário antes de executar a operação, retornando HTTP 404 caso contrário.
5. If um usuário existente (pré-multi-tenancy) fizer login sem `orgId`, the Naka OS shall criar automaticamente uma organização para ele e persistir o `orgId` antes de emitir o novo token.

---

### Requirement 4: Hierarquia de Roles e Controle de Acesso

**Objetivo:** Como admin, quero controlar o que cada membro da equipe pode ver e fazer no sistema.

#### Acceptance Criteria

1. The Naka OS shall reconhecer 5 roles em ordem hierárquica: `admin`, `socio`, `lider`, `seeder`, `cliente`.
2. The Naka OS shall conceder acesso completo ao sistema interno apenas para roles `admin`, `socio`, `lider` e `seeder`.
3. When um usuário com role `cliente` tenta acessar rotas internas, the Naka OS shall redirecionar para `/portal`.
4. When qualquer endpoint de API é acessado sem token válido, the Naka OS shall retornar HTTP 401.
5. The Naka OS shall restringir criação de convites e gestão de equipe exclusivamente a usuários com role `admin`.
6. The Naka OS shall permitir que roles `admin`, `socio` e `lider` acessem a lista de membros da equipe via `GET /api/team`.

---

### Requirement 5: Gestão de Clientes

**Objetivo:** Como membro da equipe, quero gerenciar todos os dados dos clientes do estúdio em um único lugar para ter visão completa de cada relacionamento.

#### Acceptance Criteria

1. The Naka OS shall permitir criar, editar e deletar clientes com campos: nome, indústria, status (`Ativo`/`Inativo`), logo, contato principal, email, telefone, website e descrição.
2. The Naka OS shall suportar múltiplos contatos por cliente, cada um com nome, role, email, telefone e flag `isPrimary`.
3. The Naka OS shall armazenar informações de retainer por cliente: valor mensal, horas contratadas, horas utilizadas, data de renovação e health score.
4. The Naka OS shall suportar registro de contrato com datas de início/fim, valor, status (`active`/`expired`/`pending`) e URL do documento.
5. The Naka OS shall suportar múltiplas faturas por cliente com número, valor, data de vencimento, data de pagamento e status (`paid`/`pending`/`overdue`).
6. The Naka OS shall suportar objetivos do cliente com título, descrição, prazo e status de progresso.
7. The Naka OS shall suportar informações legais/fiscais por cliente: razão social, CNPJ, endereço, regime tributário e email de cobrança.
8. The Naka OS shall suportar estratégia de marketing por cliente: metas, posicionamento, canais, KPIs e notas.
9. When um cliente é deletado, the Naka OS shall remover o registro sem validar dependências (responsabilidade do operador).

---

### Requirement 6: Gestão de Projetos

**Objetivo:** Como membro da equipe, quero organizar o trabalho em projetos associados a clientes para ter visibilidade do progresso de cada entrega.

#### Acceptance Criteria

1. The Naka OS shall permitir criar projetos com nome, descrição, status (`Ativo`/`Pausado`/`Concluído`), estágio (`Planejamento`/`Em Andamento`/`Revisão`/`Finalizado`) e progresso percentual.
2. The Naka OS shall associar projetos a um cliente (`clientId`) ou permitir projetos sem cliente (internos).
3. The Naka OS shall suportar membros do projeto com roles específicas (`PM`, `Designer`, `Developer`, etc.).
4. The Naka OS shall suportar objetivos de projeto com título, descrição e status.
5. The Naka OS shall suportar documentos de projeto com título, tipo e URL.
6. When um projeto é listado, the Naka OS shall retornar apenas projetos da organização do usuário autenticado.

---

### Requirement 7: Gestão de Tarefas (Kanban)

**Objetivo:** Como membro da equipe, quero gerenciar o fluxo de trabalho em um quadro Kanban para acompanhar o status de cada entrega em tempo real.

#### Acceptance Criteria

1. The Naka OS shall suportar 5 status de tarefa: `todo`, `in-progress`, `review`, `done`, `archived`.
2. The Naka OS shall suportar 4 níveis de prioridade: `Baixa`, `Média`, `Alta`, `Urgente`.
3. The Naka OS shall permitir atribuição de múltiplos responsáveis por tarefa.
4. The Naka OS shall suportar checklists por tarefa com itens marcáveis como concluídos.
5. The Naka OS shall suportar comentários por tarefa.
6. The Naka OS shall suportar anexos por tarefa com URLs ou uploads.
7. The Naka OS shall suportar especificação criativa (design specs) por tarefa: direção criativa, referências visuais, URL do Figma e imagem de referência.
8. The Naka OS shall suportar labels/tags configuráveis por organização para categorizar tarefas.
9. When uma tarefa tem status `done`, the Naka OS shall permitir que clientes (role `cliente`) enviem feedback de rating (1–5) e comentário.
10. The Naka OS shall associar tarefas a um projeto (`projectId`) e a um cliente (`clientId`).

---

### Requirement 8: Feedback Visual — Pins

**Objetivo:** Como membro da equipe, quero adicionar anotações visuais em imagens de tarefas para comunicar revisões de forma precisa e contextual.

#### Acceptance Criteria

1. The Naka OS shall permitir criar pins com coordenadas `x`/`y` relativas a uma imagem de tarefa, associados a `taskId` e `clientId`.
2. The Naka OS shall armazenar por pin: autor, comentário, status de resolução (`resolved`) e timestamp de criação.
3. When um pin é marcado como resolvido, the Naka OS shall persistir o estado `resolved: true`.
4. The Naka OS shall filtrar pins por `org_id` garantindo isolamento entre organizações.

---

### Requirement 9: Brand Hub — Identidade Visual

**Objetivo:** Como membro da equipe, quero centralizar a identidade visual de cada cliente para ter acesso rápido a cores, fontes, logos e guidelines de marca.

#### Acceptance Criteria

1. The Naka OS shall suportar um Brand Hub por cliente ou por projeto, identificado por `clientId` ou `projectId`.
2. The Naka OS shall armazenar paleta de cores com hex, nome e propósito por cor.
3. The Naka OS shall armazenar fontes com nome, família, peso, estilo e origem (`google`/`file`/`link`).
4. The Naka OS shall armazenar logos com nome, URL, fundo recomendado e tipo (`principal`/`alternativo`/`ícone`).
5. The Naka OS shall armazenar keywords de marca (primárias e secundárias), links de redes sociais e link do Figma.
6. The Naka OS shall armazenar guidelines: público-alvo, tom de voz, concorrentes e URL do moodboard.
7. When um Brand Hub já existe para um `clientId`/`projectId`, the Naka OS shall atualizar (upsert) o registro em vez de criar duplicata.

---

### Requirement 10: Gestão de Finanças

**Objetivo:** Como admin/sócio, quero controlar receitas e despesas do estúdio para ter visibilidade financeira do negócio.

#### Acceptance Criteria

1. The Naka OS shall suportar transações com tipo (`Receita`/`Despesa`), valor, data, categoria, status (`paid`/`pending`/`overdue`) e descrição.
2. The Naka OS shall associar transações opcionalmente a um cliente (`clientId`).
3. When transações são listadas, the Naka OS shall retornar apenas as da organização do usuário autenticado.
4. The Naka OS shall apresentar no frontend resumos de receitas, despesas e saldo do período selecionado.
5. The Naka OS shall apresentar gráfico de tendência com os últimos 6 meses de receitas e despesas.

---

### Requirement 11: Portal do Cliente

**Objetivo:** Como cliente externo, quero acompanhar o progresso das minhas entregas e enviar feedback sem ter acesso aos dados internos do estúdio.

#### Acceptance Criteria

1. When um usuário com role `cliente` faz login, the Naka OS shall redirecionar para `/portal` em vez da interface interna.
2. The Naka OS shall exibir no portal apenas as tarefas com status `done` e `review` associadas ao cliente logado.
3. When um cliente visualiza uma tarefa com status `done`, the Naka OS shall permitir envio de feedback com rating de 1 a 5 estrelas e comentário opcional.
4. The Naka OS shall impedir que usuários com role `cliente` acessem qualquer rota interna do sistema.
5. The Naka OS shall exibir o Brand Hub do cliente no portal quando disponível.

---

### Requirement 12: Gestão de Equipe

**Objetivo:** Como admin, quero gerenciar os membros da equipe e definir hierarquia de liderança para organizar a estrutura operacional do estúdio.

#### Acceptance Criteria

1. When `GET /api/team` é chamado por um `admin`, `socio` ou `lider`, the Naka OS shall retornar todos os usuários com role diferente de `cliente` que pertencem à mesma organização.
2. When um admin ou líder atualiza o `leaderId` de um membro via `PATCH /api/team/:id`, the Naka OS shall persistir a relação hierárquica apenas para membros da mesma organização.
3. The Naka OS shall impedir que membros de uma organização modifiquem dados de membros de outra organização.

---

### Requirement 13: Upload de Arquivos

**Objetivo:** Como membro da equipe, quero fazer upload de imagens e documentos para usar em tarefas, Brand Hubs e perfis de clientes.

#### Acceptance Criteria

1. When um arquivo é enviado via `POST /api/upload`, the Naka OS shall armazená-lo no Cloudflare R2 com UUID único como chave.
2. The Naka OS shall aceitar apenas os tipos: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`, `application/pdf`.
3. If o arquivo exceder 20MB, the Naka OS shall rejeitar o upload com HTTP 400.
4. When um arquivo é armazenado, the Naka OS shall retornar a URL relativa `/uploads/{uuid}.{ext}` para uso em payloads de entidades.
5. The Naka OS shall exigir autenticação para todos os uploads.

---

### Requirement 14: Notificações

**Objetivo:** Como membro da equipe, quero receber notificações sobre eventos relevantes para me manter informado sobre o que está acontecendo no projeto.

#### Acceptance Criteria

1. The Naka OS shall persistir notificações por organização com campos: título, mensagem, tipo e flag `read`.
2. When um usuário marca uma notificação como lida, the Naka OS shall persistir o estado via `PATCH /api/notifications/:id`.
3. When um usuário limpa todas as notificações, the Naka OS shall deletar todas as notificações da organização.
4. The Naka OS shall exibir contador de notificações não lidas no header da aplicação.

---

### Requirement 15: Internacionalização e Temas

**Objetivo:** Como usuário, quero escolher o idioma e tema visual da interface para personalizar minha experiência.

#### Acceptance Criteria

1. The Naka OS shall suportar dois idiomas: Português (pt-BR) e Inglês (en-US), com troca dinâmica sem reload da página.
2. The Naka OS shall persistir a preferência de idioma do usuário no localStorage.
3. The Naka OS shall suportar tema claro e escuro, com troca dinâmica via toggle na interface.
4. The Naka OS shall funcionar como Progressive Web App (PWA) com suporte a instalação e cache offline para assets estáticos.
