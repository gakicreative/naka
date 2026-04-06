# Research Log — task-views

## Summary

**Escopo investigado**: Extensão de funcionalidade existente — a página `Tasks.tsx` atual exibe cards de cliente com link para o Kanban por-cliente. A feature transforma essa página em um hub multi-visualização para todas as tarefas da organização.

**Descobertas críticas**:
1. Não há biblioteca DnD instalada (`@dnd-kit`, `react-beautiful-dnd`). O KanbanBoard existente usa HTML5 Drag and Drop nativo via eventos `onDragStart`/`onDrop`. A nova visualização Kanban adotará o mesmo padrão para manter consistência e zero dependências novas.
2. O campo `startDate` não existe na interface `Task` do store. Como tarefas usam o padrão de entidade genérica (`{ id, org_id, payload: JSON }`), adicionar `startDate` ao payload não requer migration D1 — apenas atualização do tipo TypeScript e do formulário de criação.
3. A coluna `task_view` precisa ser adicionada à tabela `users` via migration SQL (tabela estruturada, não genérica).
4. O endpoint `PATCH /api/auth/me` não existe ainda — precisa ser criado em `server/routes/auth.ts`.
5. A página `Tasks.tsx` atual é um dashboard de cards de cliente, não uma visualização de tarefas. Será refatorada para ser o contêiner multi-view.
6. O filtro de "Projeto" condicionado ao filtro de "Cliente" é puramente client-side — sem chamadas adicionais ao backend.

---

## Research Log

### Tópico 1 — Padrão de DnD existente no KanbanBoard

**Fonte**: `src/pages/KanbanBoard.tsx` (leitura direta)

**Achados**:
- Usa HTML5 DnD nativo: `onDragStart`, `onDragOver`, `onDrop` em elementos com `draggable={true}`
- Estado de drag rastreado via `useState<string | null>` para `draggingTaskId`
- Ao soltar, chama `updateTaskStatus(taskId, newStatus)` que já existe no store

**Implicação para design**: O novo `KanbanViewPanel` replicará o mesmo padrão sem adicionar dependências externas.

---

### Tópico 2 — Interface Task e campos ausentes

**Fonte**: `src/store/index.ts` linhas 233–257

**Campos existentes**: `id`, `title`, `description`, `clientId`, `projectId`, `status`, `priority`, `dueDate`, `assignees`, `createdAt`, `tags`, `checklist`, etc.

**Campo ausente**: `startDate?: string` — necessário para Timeline/Gantt (Requirement 6.2, 6.3).

**Implicação**: Adicionar `startDate?: string` à interface `Task` no store e ao formulário `NewTaskModal`. Nenhuma migration D1 necessária (campo no JSON payload).

---

### Tópico 3 — Persistência da preferência de visualização

**Fonte**: `server/routes/auth.ts`, `server/db.ts`

**Situação atual**:
- `GET /api/auth/me` retorna dados do usuário incluindo `activeClientId`
- `PATCH /api/auth/me` não existe — precisa ser criado
- Tabela `users` tem colunas explícitas: `id`, `email`, `name`, `role`, `password_hash`, `org_id`, `active_client_id`, `google_id`
- Coluna `task_view` precisa ser adicionada via migration `0002_task_view.sql`

**Valores válidos**: `'kanban' | 'list' | 'calendar' | 'timeline' | 'board-by-client'` (Requirement 2.4)

**Implicação**: Criar migration + endpoint PATCH + adicionar campo ao tipo `UserSession`.

---

### Tópico 4 — Filtros e agrupamentos (client-side only)

**Fonte**: Store Zustand, `src/store/index.ts` — dados já carregados em memória

**Situação**: Todos os dados (tarefas, clientes, projetos, teamUsers) já são carregados na inicialização pelo `AppProvider`. Filtros e agrupamentos são operações puramente client-side sobre o array `tasks` do store.

**Implicação**: Nenhum endpoint novo para filtros. Estado dos filtros fica em `useState` local no componente `Tasks.tsx` (session-scoped, não persistido). Filtros sobrevivem à troca de visualização dentro da mesma sessão (Requirement 8.6).

---

### Tópico 5 — Estrutura de componentes adotada

**Decisão**: Criar subdiretório `src/components/tasks/` para os 5 painéis de visualização + 2 componentes de controle.

**Rationale**: Alinha com o padrão feature-first do projeto (steering/structure.md). Mantém `Tasks.tsx` como orquestrador leve.

**Componentes necessários**:
- `TaskViewSelector` — seletor de visualização no header
- `TaskFilters` — filtros de cliente/projeto/responsável
- `KanbanViewPanel` — kanban all-tasks por status
- `ListViewPanel` — tabela com ordenação e agrupamento
- `CalendarViewPanel` — calendário mensal
- `TimelineViewPanel` — barras Gantt com posicionamento CSS
- `BoardByClientViewPanel` — colunas por cliente

---

### Tópico 6 — Timeline/Gantt: implementação

**Decisão**: Implementação custom com posicionamento CSS (`left` e `width` calculados em % do período visível). Sem lib externa.

**Rationale**: Evita dependência pesada (Bryntum Gantt/DHTMLX são pagos; dhtmlx-gantt/frappe-gantt têm complexidade desnecessária para o caso de uso). O período visível padrão é 30 dias (mês atual), com navegação anterior/próximo.

**Fórmula**: `left% = (taskStart - viewStart) / totalDays * 100`, `width% = (taskEnd - taskStart + 1) / totalDays * 100`.

---

### Tópico 7 — Interseção com feature white-label

**Nota**: A sidebar/header exibe a logo da organização (white-label). Nenhuma interseção com task-views exceto que ambas usam `session.orgId`. Sem conflito de implementação.
