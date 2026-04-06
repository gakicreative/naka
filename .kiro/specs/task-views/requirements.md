# Requirements: Task Views

## Metadata

- **Feature:** task-views
- **Created:** 2026-04-02
- **Language:** pt-BR
- **Status:** draft

## Visão Geral

Este documento define os requisitos para o sistema de múltiplas visualizações de tarefas do Naka OS. A funcionalidade permite que usuários alternem entre cinco modos de visualização distintos para as tarefas de sua equipe, com filtros e agrupamentos configuráveis. A preferência de visualização de cada usuário é persistida no backend.

---

## Requisitos

### Requirement 1 — Alternância de Visualizações

**When** o usuário acessa a área de tarefas, **the system shall** exibir um seletor de visualização no cabeçalho da área de tarefas com as cinco opções disponíveis: Kanban, Lista, Calendário, Timeline/Gantt e Board por Cliente.

**Acceptance Criteria:**

- 1.1 — **The system shall** apresentar os cinco modos de visualização como opções selecionáveis no cabeçalho da área de tarefas.
- 1.2 — **When** o usuário seleciona um modo de visualização, **the system shall** renderizar imediatamente o conteúdo das tarefas no formato escolhido, sem recarregar a página.
- 1.3 — **The system shall** destacar visualmente o modo de visualização atualmente ativo no seletor.
- 1.4 — **When** o usuário acessa a área de tarefas pela primeira vez sem preferência salva, **the system shall** exibir a visualização Kanban como padrão.

---

### Requirement 2 — Persistência da Preferência de Visualização

**When** o usuário seleciona um modo de visualização, **the system shall** persistir essa preferência no backend via `PATCH /api/auth/me` e restaurá-la automaticamente na próxima sessão.

**Acceptance Criteria:**

- 2.1 — **When** o usuário troca de visualização, **the system shall** enviar uma requisição `PATCH /api/auth/me` com o campo `taskView` atualizado.
- 2.2 — **When** o usuário carrega a aplicação em uma nova sessão, **the system shall** recuperar a preferência de visualização salva e aplicá-la automaticamente.
- 2.3 — **If** a requisição de persistência falhar, **the system shall** manter a visualização selecionada na sessão atual e exibir uma notificação discreta de erro, sem reverter a escolha do usuário.
- 2.4 — **The system shall** aceitar os valores `kanban`, `list`, `calendar`, `timeline` e `board-by-client` como valores válidos para o campo `taskView` no perfil do usuário.

---

### Requirement 3 — Visualização Kanban (Padrão)

**When** o modo Kanban está ativo, **the system shall** exibir as tarefas organizadas em colunas por status, permitindo arrastar e soltar entre colunas.

**Acceptance Criteria:**

- 3.1 — **The system shall** criar uma coluna para cada status de tarefa existente no sistema (ex.: "A Fazer", "Em Progresso", "Concluído").
- 3.2 — **When** o usuário arrasta uma tarefa para outra coluna, **the system shall** atualizar o status da tarefa imediatamente na interface e persistir a mudança no backend.
- 3.3 — **The system shall** exibir em cada card de tarefa: título, cliente, projeto, responsável, prioridade e data de vencimento.
- 3.4 — **The system shall** exibir o contador de tarefas no cabeçalho de cada coluna.

---

### Requirement 4 — Visualização Lista

**When** o modo Lista está ativo, **the system shall** exibir todas as tarefas em uma tabela plana com colunas ordenáveis.

**Acceptance Criteria:**

- 4.1 — **The system shall** exibir as tarefas em uma tabela com as colunas: título, status, prioridade, cliente, projeto, responsável, data de início e data de vencimento.
- 4.2 — **When** o usuário clica no cabeçalho de uma coluna, **the system shall** ordenar as tarefas por aquele campo em ordem ascendente; ao clicar novamente, **the system shall** inverter para ordem descendente.
- 4.3 — **The system shall** indicar visualmente qual coluna está sendo usada para ordenação e a direção atual (ascendente ou descendente).
- 4.4 — **When** o usuário clica em uma tarefa na lista, **the system shall** abrir o painel de detalhes da tarefa.

---

### Requirement 5 — Visualização Calendário

**When** o modo Calendário está ativo, **the system shall** exibir as tarefas posicionadas na data de vencimento de cada uma em um calendário mensal.

**Acceptance Criteria:**

- 5.1 — **The system shall** renderizar um calendário mensal com navegação entre meses (anterior e próximo).
- 5.2 — **The system shall** posicionar cada tarefa na célula do dia correspondente à sua data de vencimento (`due_date`).
- 5.3 — **If** uma tarefa não possui data de vencimento, **the system shall** omiti-la da visualização de calendário e indicar ao usuário a quantidade de tarefas sem data em um aviso no topo da visualização.
- 5.4 — **When** múltiplas tarefas possuem a mesma data de vencimento, **the system shall** empilhá-las na mesma célula e exibir um indicador de quantidade quando o número de tarefas exceder o espaço disponível.
- 5.5 — **When** o usuário clica em uma tarefa no calendário, **the system shall** abrir o painel de detalhes da tarefa.

---

### Requirement 6 — Visualização Timeline/Gantt

**When** o modo Timeline está ativo, **the system shall** exibir as tarefas como barras horizontais posicionadas entre a data de início e a data de vencimento de cada uma.

**Acceptance Criteria:**

- 6.1 — **The system shall** renderizar um eixo de tempo horizontal com granularidade diária e navegação lateral (anterior e próximo período).
- 6.2 — **The system shall** exibir cada tarefa como uma barra horizontal cuja posição inicial corresponde à `start_date` e cuja posição final corresponde à `due_date`.
- 6.3 — **If** uma tarefa não possui `start_date`, **the system shall** usar a `due_date` como data de início para fins de renderização, exibindo a barra com largura mínima de um dia.
- 6.4 — **If** uma tarefa não possui nem `start_date` nem `due_date`, **the system shall** omiti-la da visualização e indicar ao usuário a quantidade de tarefas sem datas em um aviso no topo.
- 6.5 — **The system shall** colorir as barras de acordo com a prioridade da tarefa.
- 6.6 — **When** o usuário passa o cursor sobre uma barra, **the system shall** exibir um tooltip com título, responsável, data de início, data de vencimento e status.
- 6.7 — **When** o usuário clica em uma barra, **the system shall** abrir o painel de detalhes da tarefa.

---

### Requirement 7 — Visualização Board por Cliente

**When** o modo Board por Cliente está ativo, **the system shall** exibir as tarefas organizadas em colunas, onde cada coluna representa um cliente.

**Acceptance Criteria:**

- 7.1 — **The system shall** criar uma coluna por cliente que possua pelo menos uma tarefa visível (considerando os filtros ativos).
- 7.2 — **The system shall** exibir o nome e o avatar/logotipo do cliente no cabeçalho de cada coluna.
- 7.3 — **The system shall** exibir o contador de tarefas no cabeçalho de cada coluna de cliente.
- 7.4 — **If** existirem tarefas sem cliente associado, **the system shall** agrupá-las em uma coluna especial denominada "Sem Cliente".
- 7.5 — **When** o usuário clica em uma tarefa no board por cliente, **the system shall** abrir o painel de detalhes da tarefa.

---

### Requirement 8 — Filtros de Tarefas

**When** o usuário está em qualquer visualização, **the system shall** disponibilizar filtros por cliente, por projeto e por responsável no cabeçalho da área de tarefas.

**Acceptance Criteria:**

- 8.1 — **The system shall** exibir três controles de filtro no cabeçalho: "Cliente", "Projeto" e "Responsável", cada um com seleção múltipla.
- 8.2 — **When** o usuário seleciona um ou mais valores em um filtro, **the system shall** atualizar imediatamente todas as visualizações para exibir apenas as tarefas que correspondam aos critérios selecionados.
- 8.3 — **When** o filtro de "Cliente" possui valores selecionados, **the system shall** restringir as opções disponíveis no filtro de "Projeto" apenas aos projetos vinculados aos clientes selecionados.
- 8.4 — **The system shall** indicar visualmente quando há filtros ativos, exibindo um badge ou contador no seletor de filtros.
- 8.5 — **When** o usuário clica em "Limpar Filtros", **the system shall** remover todos os filtros ativos e restaurar a visualização completa de tarefas.
- 8.6 — **The system shall** manter os filtros ativos ao alternar entre visualizações dentro da mesma sessão.

---

### Requirement 9 — Agrupamento de Tarefas

**When** o usuário está na visualização Lista, **the system shall** disponibilizar opções de agrupamento das tarefas por: cliente, projeto, responsável, prioridade e status.

**Acceptance Criteria:**

- 9.1 — **The system shall** exibir um seletor de agrupamento na visualização Lista com as opções: "Sem Agrupamento", "Por Cliente", "Por Projeto", "Por Responsável", "Por Prioridade" e "Por Status".
- 9.2 — **When** o usuário seleciona um critério de agrupamento, **the system shall** reorganizar a lista em seções colapsáveis, onde cada seção corresponde a um valor do critério selecionado.
- 9.3 — **The system shall** exibir o nome do grupo e o contador de tarefas no cabeçalho de cada seção.
- 9.4 — **When** o usuário clica no cabeçalho de uma seção, **the system shall** colapsar ou expandir o grupo correspondente.
- 9.5 — **If** não houver critério de agrupamento selecionado, **the system shall** exibir as tarefas em uma lista plana e permitir a ordenação por qualquer coluna conforme o Requirement 4.

---

### Requirement 10 — Consistência dos Dados entre Visualizações

**While** o usuário navega entre as visualizações, **the system shall** garantir que o mesmo conjunto de dados de tarefas seja exibido em todos os modos, aplicando os filtros ativos de forma consistente.

**Acceptance Criteria:**

- 10.1 — **The system shall** utilizar uma única fonte de dados (store global) para todas as visualizações, de modo que alterações feitas em uma visualização sejam refletidas imediatamente nas demais.
- 10.2 — **When** uma tarefa é editada ou criada em qualquer visualização, **the system shall** atualizar o dado na store e refletir a mudança em todas as visualizações sem necessidade de recarregar a página.
- 10.3 — **When** o usuário alterna entre visualizações, **the system shall** aplicar os mesmos filtros ativos e exibir o mesmo conjunto de tarefas, independentemente do modo escolhido.
- 10.4 — **The system shall** exibir um indicador de carregamento enquanto os dados das tarefas estão sendo buscados do backend, em todas as visualizações.
