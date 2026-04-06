# Requirements Document

## Informações do Spec

- **Feature**: white-label
- **Idioma**: pt-BR
- **Data**: 2026-04-02
- **Fase**: Requirements

## Descrição do Projeto

White-label por organização no SaaS Naka OS para agências de marketing: cada organização pode fazer upload da sua logo e configurar sua identidade visual. A logo da agência aparece no painel interno (sidebar/header) e também no portal do cliente, substituindo qualquer identidade padrão do Naka OS. O cliente vê o painel com a marca da agência que o atende, não com a marca do Naka OS.

**Escopo desta fase:** somente logotipo — sem cores customizadas, sem domínio próprio.

---

## Requirements

### Requirement 1 — Upload de Logo por Organização

**User Story**: Como administrador de uma organização, quero fazer upload da logo da minha agência para que ela apareça no sistema no lugar da identidade padrão do Naka OS.

#### Acceptance Criteria

**1.1** When o administrador acessa a página de configurações da organização e seleciona um arquivo de imagem (JPEG, PNG, WebP ou SVG), The system shall fazer upload do arquivo via `POST /api/upload` (endpoint R2 existente) e armazenar a URL retornada no campo `logo_url` da tabela `organizations` no banco D1.

**1.2** When o upload é concluído com sucesso, The system shall exibir uma mensagem de confirmação (toast de sucesso) e atualizar imediatamente a logo exibida na interface sem necessidade de recarregar a página.

**1.3** If o arquivo selecionado não for uma imagem (JPEG, PNG, WebP, SVG), The system shall rejeitar o upload antes de enviá-lo ao servidor e exibir uma mensagem de erro informando os formatos aceitos.

**1.4** If o arquivo exceder 5 MB, The system shall rejeitar o upload no frontend e exibir uma mensagem de erro informando o limite de tamanho.

**1.5** If o upload falhar por erro de rede ou servidor, The system shall exibir uma mensagem de erro e manter a logo anterior inalterada.

**1.6** The system shall restringir o endpoint de atualização de logo da organização a usuários com role `admin` ou `socio`, retornando HTTP 403 para qualquer outra role.

---

### Requirement 2 — Armazenamento da URL da Logo

**User Story**: Como desenvolvedor, quero que a URL da logo da organização seja persistida na tabela `organizations` do D1 para que possa ser recuperada em qualquer contexto autenticado ou de portal público.

#### Acceptance Criteria

**2.1** The system shall adicionar a coluna `logo_url TEXT` (nullable) à tabela `organizations` no banco D1 via migration SQL manual em `migrations/`.

**2.2** When a URL da logo é salva, The system shall armazená-la como caminho relativo no formato `/uploads/{uuid}.{ext}`, compatível com o padrão já utilizado pelo endpoint `POST /api/upload`.

**2.3** The system shall expor a `logo_url` da organização no endpoint `GET /api/auth/me` (ou equivalente de perfil/sessão), para que o frontend possa inicializar o estado global com a logo correta após o login.

**2.4** If a coluna `logo_url` for `NULL` (nenhuma logo configurada), The system shall retornar `null` no JSON de resposta, sinalizando ao frontend que deve usar o fallback.

---

### Requirement 3 — Exibição da Logo no Painel Interno

**User Story**: Como membro da equipe de uma agência, quero ver a logo da minha organização na sidebar e no header do painel interno para que a experiência seja da minha agência, não do Naka OS.

#### Acceptance Criteria

**3.1** When o usuário está autenticado e a organização possui `logo_url` configurada, The system shall exibir a logo da organização na sidebar (posição onde atualmente aparece a logo padrão do Naka OS), substituindo-a completamente.

**3.2** When o usuário está autenticado e a organização possui `logo_url` configurada, The system shall exibir a mesma logo no header do painel interno, em substituição à identidade padrão do Naka OS.

**3.3** If a organização não possui `logo_url` configurada (`null`), The system shall exibir um fallback textual com as iniciais do nome da organização (ex.: "NA" para "Naka Agency") na sidebar e no header.

**3.4** While a logo está sendo carregada (estado de loading inicial), The system shall exibir um placeholder neutro (skeleton ou bloco vazio) no lugar da logo para evitar flash de conteúdo.

**3.5** If a imagem da logo falhar ao carregar (URL inválida ou R2 indisponível), The system shall substituir automaticamente pela exibição do fallback textual com as iniciais da organização.

---

### Requirement 4 — Exibição da Logo no Portal do Cliente

**User Story**: Como cliente de uma agência, quero ver a logo da agência que me atende no portal, e não qualquer referência ao Naka OS, para que a experiência seja completamente da minha agência.

#### Acceptance Criteria

**4.1** When um usuário com role `cliente` acessa o portal, The system shall exibir a logo da organização à qual esse cliente pertence no lugar de qualquer logo ou referência visual do Naka OS.

**4.2** The system shall carregar a `logo_url` da organização do cliente a partir de um endpoint público ou semi-público (sem exigir dados sensíveis de admin), retornando apenas o nome e a `logo_url` da organização com base no `org_id` do JWT do cliente.

**4.3** If a organização do cliente não possui `logo_url` configurada, The system shall exibir no portal o fallback textual com as iniciais do nome da organização, sem qualquer referência à marca Naka OS.

**4.4** If a imagem da logo falhar ao carregar no portal do cliente, The system shall exibir o fallback textual com as iniciais da organização, garantindo que o cliente nunca veja a logo padrão do Naka OS.

---

### Requirement 5 — Remoção da Logo

**User Story**: Como administrador, quero poder remover a logo da minha organização para voltar ao estado sem logo configurada.

#### Acceptance Criteria

**5.1** When o administrador clica na opção de remover a logo na página de configurações, The system shall exibir uma confirmação antes de prosseguir com a remoção.

**5.2** When o administrador confirma a remoção, The system shall atualizar o campo `logo_url` da organização para `NULL` no banco D1 e atualizar imediatamente a interface para exibir o fallback textual.

**5.3** The system shall restringir a ação de remoção de logo a usuários com role `admin` ou `socio`, retornando HTTP 403 para qualquer outra role.

---

### Requirement 6 — Atualização da Logo (Substituição)

**User Story**: Como administrador, quero poder substituir a logo atual por uma nova imagem sem precisar remover a anterior primeiro.

#### Acceptance Criteria

**6.1** When o administrador faz upload de uma nova logo enquanto já existe uma logo configurada, The system shall substituir a URL armazenada pela nova URL, efetivamente trocando a logo exibida em toda a aplicação.

**6.2** The system shall atualizar a logo exibida em tempo real na interface (sidebar, header e portal do cliente) após a substituição, sem necessidade de logout/login.

---

### Requirement 7 — Página de Configurações da Organização

**User Story**: Como administrador, quero uma seção dedicada nas configurações para gerenciar a logo da organização, com interface clara para upload, visualização e remoção.

#### Acceptance Criteria

**7.1** The system shall disponibilizar uma seção "Logo da Organização" dentro da página de configurações (Settings), acessível apenas para usuários com role `admin` ou `socio`.

**7.2** When a organização possui uma logo configurada, The system shall exibir a logo atual em preview (thumbnail) nessa seção, ao lado dos controles de substituição e remoção.

**7.3** When a organização não possui logo configurada, The system shall exibir na seção uma área de drop ou botão de seleção de arquivo, com instruções sobre os formatos aceitos (JPEG, PNG, WebP, SVG) e o limite de tamanho (5 MB).

**7.4** The system shall atualizar o estado global do Zustand store com a nova `logo_url` após upload ou remoção bem-sucedidos, garantindo que todos os componentes que consomem a logo reflitam a mudança imediatamente.

---

### Requirement 8 — Isolamento Multi-tenant

**User Story**: Como produto SaaS multi-tenant, o sistema deve garantir que a logo de uma organização seja completamente isolada e nunca vaze para outra organização.

#### Acceptance Criteria

**8.1** The system shall associar a `logo_url` exclusivamente ao `org_id` da organização autenticada no momento do upload, impedindo que um usuário de uma organização altere ou visualize a logo de outra organização.

**8.2** Where qualquer endpoint de leitura ou escrita de `logo_url` for invocado, The system shall validar que o `org_id` extraído do JWT corresponde à organização sendo consultada ou modificada, retornando HTTP 403 em caso de divergência.

**8.3** If dois usuários de organizações distintas estiverem autenticados simultaneamente, The system shall garantir que cada um veja exclusivamente a logo de sua própria organização em todos os contextos (sidebar, header e portal do cliente).
