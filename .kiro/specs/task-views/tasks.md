# Implementation Plan

## Task Summary

- **Feature:** task-views
- **Total:** 10 major tasks, 22 sub-tasks
- **Requirements covered:** 1.1–10.4 (all 10 requirement groups, 37 acceptance criteria)

---

- [x] 1. Backend — Migração e Schema
- [x] 1.1 Criar arquivo de migração para adicionar a coluna `task_view` na tabela `users`
  - Criar `migrations/0002_task_view.sql` com `ALTER TABLE users ADD COLUMN task_view TEXT`
  - Valor NULL indica preferência padrão; validação dos valores ocorre no endpoint
  - _Requirements: 2.4_

- [x] 1.2 Atualizar o schema Drizzle para refletir a nova coluna
  - Adicionar campo `taskView: text('task_view')` na definição da tabela `users` em `server/db.ts`
  - Depende da migration 1.1
  - _Requirements: 2.4_

- [x] 2. Backend — Endpoints de Perfil
- [x] 2.1 (P) Atualizar `GET /api/auth/me` para incluir `taskView` na resposta
  - Incluir o campo `taskView` ao montar o objeto de resposta do usuário autenticado
  - Frontend usa `taskView` para restaurar preferência na próxima sessão
  - _Requirements: 2.2_

- [x] 2.2 (P) Criar endpoint `PATCH /api/auth/me` para persistir a preferência de visualização
  - Registrar a rota no router de auth com middleware `requireAuth`
  - Extrair `userId` do JWT; nunca do body da requisição
  - Validar que `taskView` pertence ao conjunto `['kanban','list','calendar','timeline','board-by-client']`; retornar 400 para valores inválidos
  - Gravar o valor validado na coluna `task_view` do usuário
  - _Requirements: 2.1, 2.4_

- [x] 3. Store — Tipos e Ações
- [x] 3.1 (P) Adicionar tipos TypeScript para o sistema de visualizações
  - Definir `TaskViewType` como union dos 5 valores válidos
  - Adicionar campo `startDate?: string` na interface `Task`
  - Adicionar campo `taskView?: TaskViewType` na interface `UserSession`
  - _Requirements: 2.4, 6.2, 6.3_

- [x] 3.2 (P) Adicionar ação `updateTaskView` ao Zustand store
  - Criar action que atualiza `session.taskView` no store local
  - A action opera de forma síncrona no estado; a persistência remota é responsabilidade do orquestrador
  - Depende dos tipos definidos em 3.1
  - _Requirements: 2.1_

- [x] 3.3 Atualizar o `AppProvider` para carregar e inicializar `taskView` do backend
  - Ler `me.taskView` do response de `GET /api/auth/me` e gravar no store via `updateTaskView`
  - Garantir que `isAuthReady` só é marcado como `true` após inicialização completa
  - Depende de 2.1 (endpoint atualizado) e 3.2 (action no store)
  - _Requirements: 2.2_

- [x] 4. Tasks.tsx — Orquestrador Multi-Visualização
- [x] 4.1 Refatorar `Tasks.tsx` como hub multi-view com estado de sessão
  - Substituir o conteúdo atual (cards de cliente) pelo orquestrador de visualizações
  - Inicializar `activeView` a partir de `session.taskView ?? 'kanban'`
  - Manter `filters` e `groupBy` em `useState` local (escopo de sessão)
  - Exibir skeleton de carregamento enquanto `!isAuthReady`
  - _Requirements: 1.2, 1.4, 10.1, 10.4_

- [x] 4.2 Implementar lógica de filtros e persistência de visualização no orquestrador
  - Derivar `filteredTasks` com `useMemo` aplicando filtros por clientIds, projectIds e assigneeNames (OR intra-dimensão, AND entre dimensões)
  - Ao trocar de visualização: chamar `updateTaskView`, renderizar o novo painel imediatamente e disparar `PATCH /api/auth/me` de forma assíncrona (fire-and-forget)
  - Em caso de falha do PATCH, exibir toast discreto sem reverter a visualização escolhida
  - Filtros mantidos ao alternar entre visualizações
  - _Requirements: 2.1, 2.3, 8.2, 8.6, 10.3_

- [x] 5. Controles de Header
- [x] 5.1 (P) Construir componente `TaskViewSelector`
  - Renderizar grupo de 5 botões com ícone e label para cada visualização
  - Destacar visualmente a view ativa (`bg-primary/10 text-primary`) e deixar as demais em `text-on-surface-variant`
  - Emitir callback `onChange(view)` ao clicar; receber `activeView` por prop
  - Usar atributo `aria-pressed` para acessibilidade
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 5.2 (P) Construir componente `TaskFilters`
  - Renderizar três dropdowns multi-select: Cliente, Projeto e Responsável
  - Derivar internamente `availableProjects` com base nos clientes selecionados (filtro cascata)
  - Calcular `activeFilterCount` e exibir badge numérico quando > 0
  - Implementar botão "Limpar Filtros" que emite `onClear`
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [x] 6. KanbanViewPanel
- [x] 6.1 (P) Construir colunas de status com cards de tarefa
  - Criar uma coluna para cada status fixo (`todo`, `in-progress`, `review`, `done`) com header e contador
  - Cada card exibe: título, cliente, projeto, responsável(eis), prioridade (badge colorido) e data de vencimento
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 6.2 (P) Implementar drag-and-drop nativo para mudança de status
  - Usar HTML5 nativo (`draggable`, `onDragStart`, `onDrop`) seguindo o padrão do `KanbanBoard.tsx` existente
  - Ao soltar, chamar `onStatusChange(taskId, newStatus)` e atualizar o store imediatamente
  - Em caso de falha da persistência, reverter o status e exibir toast de erro
  - _Requirements: 3.2_

- [x] 7. ListViewPanel
- [x] 7.1 (P) Construir tabela ordenável com 8 colunas
  - Renderizar tabela com colunas: título, status, prioridade, cliente, projeto, responsável, data de início e data de vencimento
  - Manter estado `SortState` local; ao clicar no header da coluna, alternar entre `asc` e `desc`
  - Exibir ícone direcional (`ChevronUp`/`ChevronDown`) na coluna ativa
  - Click em linha chama `onTaskClick(task.id)`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7.2 (P) Adicionar seletor de agrupamento com seções colapsáveis
  - Renderizar dropdown com as opções: Sem Agrupamento, Por Cliente, Por Projeto, Por Responsável, Por Prioridade e Por Status
  - Quando agrupamento ativo, reorganizar tasks em `GroupedSection[]` e renderizar seções colapsáveis
  - Exibir nome do grupo e contador de tarefas no header de cada seção; toggle colapsar/expandir ao clicar
  - Quando sem agrupamento, exibir lista plana ordenável conforme 7.1
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 8. CalendarViewPanel
- [x] 8.1 (P) Construir grid mensal com navegação entre meses
  - Renderizar grid 7×6 (Dom–Sáb) com células para cada dia; dias fora do mês atual com opacidade reduzida
  - Botões `←` / `→` no header controlam `currentMonth` (estado local)
  - _Requirements: 5.1_

- [x] 8.2 (P) Posicionar tarefas nas células e tratar overflow e tarefas sem data
  - Posicionar cada tarefa na célula correspondente à sua `dueDate`
  - Exibir máximo 3 tarefas por célula + badge `+N mais` para overflow
  - Tarefas sem `dueDate` omitidas; exibir aviso fixo no topo com a contagem
  - Click em tarefa chama `onTaskClick(task.id)`
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 9. TimelineViewPanel
- [x] 9.1 (P) Construir eixo de tempo e barras Gantt com CSS positioning
  - Renderizar eixo horizontal com granularidade diária (padrão: 30 dias a partir do início do mês atual)
  - Calcular `leftPercent` e `widthPercent` para cada tarefa: `left = (taskStart - viewStart) / totalDays`, `width = (taskEnd - taskStart + 1) / totalDays` (mínimo 1/totalDays)
  - Quando `startDate` ausente, usar `dueDate` como início com largura mínima de 1 dia
  - Colorir barras por prioridade: urgente/alta → vermelho, média → azul, baixa → verde
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 9.2 (P) Adicionar navegação de período, tooltip e tratamento de tarefas sem datas
  - Botões anterior/próximo avançam/recuam 30 dias via `setViewStart`
  - Tooltip no hover exibe: título, responsável, startDate, dueDate, status (div absolutamente posicionado)
  - Tarefas sem `startDate` e sem `dueDate` omitidas; exibir aviso no topo com contagem
  - Click em barra chama `onTaskClick(task.id)`
  - _Requirements: 6.4, 6.6, 6.7_

- [x] 10. BoardByClientViewPanel
- [x] 10.1 (P) Construir colunas por cliente com migração da lógica atual de `Tasks.tsx`
  - Derivar `ClientColumn[]` agrupando as tasks recebidas por `clientId`
  - Criar uma coluna por cliente que tenha ao menos uma tarefa visível; exibir nome e avatar no header com contador
  - Tasks sem `clientId` agrupadas em coluna "Sem Cliente" exibida por último
  - Click em tarefa chama `onTaskClick(task.id)`
  - Migrar a lógica de exibição de cards atualmente em `Tasks.tsx` para este componente
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 11. Testes — Backend e Lógica de Filtros
- [ ]* 11.1 Testes de integração para os endpoints de perfil
  - Verificar que `PATCH /api/auth/me` persiste `taskView` válido no D1
  - Verificar que `PATCH /api/auth/me` retorna 400 para valor inválido
  - Verificar que `GET /api/auth/me` inclui `taskView` na resposta após gravação
  - _Requirements: 2.1, 2.2, 2.4_

- [ ]* 11.2 Testes unitários para funções de lógica client-side
  - `applyFilters`: combinações vazio, único, múltiplos, cruzados cliente+projeto
  - `calcBarStyle`: tarefa com datas, sem startDate, sem datas, fora do período
  - `groupTasks`: cada critério de agrupamento
  - `sortTasks`: cada coluna, asc e desc
  - _Requirements: 8.2, 6.2, 9.2, 4.2_
