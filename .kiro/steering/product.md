# Product Overview

Naka OS é um **Sistema Operacional para Estúdios Criativos** — uma plataforma de gestão all-in-one para agências e estúdios de design/marketing gerenciarem clientes, projetos, tarefas, finanças e identidade de marca em um único lugar.

## Core Capabilities

- **Gestão de Clientes**: Perfis completos com contratos, retainers, faturas, objetivos e health score
- **Gestão de Projetos e Tarefas**: Kanban com 5 status, prioridades, checklists e specs criativas
- **Brand Hub**: Sistema de identidade visual por cliente (paleta, fontes, logos, guidelines)
- **Finanças**: Controle de receitas/despesas com gráficos de tendência mensal
- **Portal do Cliente**: Visão read-only para clientes acompanharem entregas e enviarem feedback

## Target Use Cases

1. **Estúdio com equipe pequena (2-10 pessoas)**: Um admin gerencia clientes e delega tarefas a líderes e seeders
2. **Agência com múltiplos clientes**: Isolamento total de dados por organização; cada workspace é independente
3. **Cliente externo**: Acesso limitado ao portal para ver tarefas e aprovar entregas sem ver dados internos

## Value Proposition

Naka OS elimina o uso de múltiplas ferramentas dispersas (Trello, Notion, Drive, planilhas) oferecendo um único sistema com hierarquia de acesso por role, integrado com Google OAuth e rodando 100% em edge (Cloudflare Workers) sem servidor próprio para gerenciar.

## Business Model (SaaS — em construção)

- **Multi-tenant**: cada estúdio é uma `organization` independente
- **Planos por organização**: Free / Pro / Agency com limites de clientes, usuários e storage
- **Self-service**: cadastro público → cria org → escolhe plano → paga (Stripe)
- **Invite-based onboarding**: membros da equipe entram via convite da org

## Role Hierarchy

```
admin → socio → lider → seeder → cliente
```

- `admin/socio/lider`: acesso completo ao sistema interno
- `seeder`: colaborador com acesso limitado
- `cliente`: apenas o portal (visão read-only + feedback)

---
_Foco: gestão operacional de estúdios criativos com experiência premium e baixo custo de infraestrutura_
