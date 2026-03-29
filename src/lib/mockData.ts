import type { Client, Project, Task, Transaction, TaskLabel, Notification, BrandHub, ProjectMember } from '../store';

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

export const MOCK_SESSION = {
  role: 'admin' as const,
  name: 'Dev Admin',
  email: 'dev@naka.local',
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'mock-client-1',
    name: 'Acme Studio',
    industry: 'Design',
    status: 'Ativo',
    logo: 'A',
    contact: 'Ana Lima',
    email: 'ana@acme.com',
    phone: '(11) 91234-5678',
    website: 'https://acme.studio',
    figmaLink: 'https://figma.com/file/acme-main',
    description: 'Estúdio de design especializado em branding e identidade visual para startups de tecnologia. Atendemos empresas B2B em fase de crescimento que precisam se posicionar visualmente no mercado.',
    maxActiveTasks: 3,
    createdAt: yesterday,
    objectives: [
      { id: 'o1', title: 'Lançar novo site institucional', status: 'in-progress', dueDate: nextWeek },
      { id: 'o2', title: 'Criar brandbook completo', status: 'pending' },
      { id: 'o3', title: 'Entregar kit de redes sociais', status: 'done' },
    ],
    contract: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      value: 3500,
      status: 'active',
      description: 'Retainer mensal cobrindo até 40h de trabalho criativo, incluindo design, estratégia e revisões ilimitadas.',
    },
    invoices: [
      { id: 'inv1', number: '2024-001', amount: 3500, dueDate: '2024-02-10', paidDate: '2024-02-08', status: 'paid' },
      { id: 'inv2', number: '2024-002', amount: 3500, dueDate: '2024-03-10', status: 'pending' },
    ],
    marketingDocs: [
      { id: 'md1', title: 'Brief de Rebranding 2024', type: 'brief', url: 'https://docs.google.com', createdAt: '2024-01-15' },
      { id: 'md2', title: 'Relatório Q1 2024', type: 'report', url: 'https://docs.google.com', createdAt: '2024-03-31' },
    ],
    strategy: {
      goals: 'Consolidar a Acme como referência em design para startups tech no Brasil até 2025.',
      positioning: 'Design estratégico premium — não somos uma agência tradicional, somos um parceiro de crescimento.',
      channels: 'LinkedIn, Behance, indicações diretas, conteúdo técnico no blog.',
      kpis: 'NPS do cliente ≥ 8, taxa de renovação de contrato ≥ 85%, 3 novos clientes por trimestre via indicação.',
      notes: 'Cliente preferencial. Reunião mensal de estratégia toda primeira segunda-feira.',
    },
    contacts: [
      { id: 'c1', name: 'Ana Lima', role: 'CEO', email: 'ana@acme.com', phone: '(11) 91234-5678', isPrimary: true },
      { id: 'c2', name: 'Pedro Nunes', role: 'Head de Design', email: 'pedro@acme.com', phone: '(11) 99876-5432', isPrimary: false },
    ],
    legalInfo: {
      legalName: 'Acme Studio Criação e Desenvolvimento Ltda.',
      cnpj: '12.345.678/0001-90',
      address: 'Rua dos Pinheiros, 850, Cj. 42, Pinheiros, São Paulo - SP, 05422-010',
      taxRegime: 'Simples Nacional',
      billingEmail: 'financeiro@acme.com',
    },
    retainer: {
      value: 3500,
      hours: 40,
      loggedHours: 22,
      renewalDate: '2024-12-31',
      healthScore: 88,
      focus: ['Branding', 'Web Design', 'Motion'],
    },
  },
  {
    id: 'mock-client-2',
    name: 'Bloom Foods',
    industry: 'Alimentação',
    status: 'Ativo',
    logo: 'B',
    contact: 'Bruno Costa',
    email: 'bruno@bloom.com',
    phone: '(11) 98765-4321',
    website: 'https://bloom.com',
    description: 'Marca de alimentos naturais e orgânicos com foco no varejo físico e e-commerce próprio. Crescimento acelerado no Sudeste brasileiro.',
    maxActiveTasks: 2,
    objectives: [
      { id: 'o4', title: 'Desenvolver campanha de verão', status: 'in-progress', dueDate: nextWeek },
      { id: 'o5', title: 'Criar linha de embalagens sustentáveis', status: 'pending' },
    ],
    contract: {
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      value: 2800,
      status: 'active',
      description: 'Contrato de retainer para campanhas sazonais e gestão da identidade visual.',
    },
    invoices: [
      { id: 'inv3', number: '2024-003', amount: 2800, dueDate: '2024-02-15', paidDate: '2024-02-14', status: 'paid' },
      { id: 'inv4', number: '2024-004', amount: 2800, dueDate: '2024-03-15', status: 'overdue' },
    ],
    marketingDocs: [
      { id: 'md3', title: 'Brief Campanha Verão', type: 'brief', url: 'https://docs.google.com', createdAt: '2024-03-01' },
    ],
    strategy: {
      goals: 'Aumentar presença no e-commerce em 40% e expandir para o Sul do Brasil.',
      positioning: 'Alimento natural acessível — qualidade sem abrir mão do bolso.',
      channels: 'Instagram, TikTok, pontos de venda físicos, parcerias com nutricionistas.',
      kpis: 'Crescimento de 20% no GMV mensal, 50k seguidores no Instagram até dezembro.',
    },
    contacts: [
      { id: 'c3', name: 'Bruno Costa', role: 'Fundador & CEO', email: 'bruno@bloom.com', phone: '(11) 98765-4321', isPrimary: true },
    ],
    legalInfo: {
      legalName: 'Bloom Natural Alimentos S/A',
      cnpj: '98.765.432/0001-10',
      address: 'Av. Brigadeiro Faria Lima, 2300, Itaim Bibi, São Paulo - SP',
      taxRegime: 'Lucro Presumido',
      billingEmail: 'contas@bloom.com',
    },
  },
  {
    id: 'mock-client-3',
    name: 'Vertex Tech',
    industry: 'Tecnologia',
    status: 'Ativo',
    logo: 'V',
    contact: 'Carla Santos',
    email: 'carla@vertex.tech',
    phone: '(21) 97654-3210',
    website: 'https://vertex.tech',
    description: 'Scale-up de tecnologia com produto SaaS B2B para gestão de frotas. Presença em 5 países da América Latina.',
    maxActiveTasks: 4,
    objectives: [
      { id: 'o6', title: 'Redesign do app mobile v2', status: 'in-progress' },
      { id: 'o7', title: 'Criar design system completo', status: 'pending' },
      { id: 'o8', title: 'Pitch deck para rodada Série A', status: 'done' },
    ],
    contacts: [
      { id: 'c4', name: 'Carla Santos', role: 'CPO', email: 'carla@vertex.tech', phone: '(21) 97654-3210', isPrimary: true },
      { id: 'c5', name: 'Rafael Melo', role: 'CEO', email: 'rafael@vertex.tech', isPrimary: false },
    ],
    legalInfo: {
      legalName: 'Vertex Tecnologia e Inovação SA',
      cnpj: '45.678.901/0001-23',
      address: 'Rua Lauro Muller, 116, Botafogo, Rio de Janeiro - RJ',
      taxRegime: 'Lucro Real',
      billingEmail: 'billing@vertex.tech',
    },
  },
];

const TEAM_ADMIN: ProjectMember = { id: 'tm-admin', name: 'Dev Admin', role: 'Diretor de Criação', email: 'dev@naka.local' };

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'mock-project-1',
    name: 'Redesign do Site Acme',
    status: 'Ativo',
    stage: 'Em Andamento',
    progress: 45,
    dueDate: nextWeek,
    team: 2,
    description: 'Redesign completo do site institucional da Acme Studio. Inclui nova arquitetura de informação, design system próprio e integração com CMS headless.',
    notes: 'Cliente pediu entrega parcial da home até o dia 10. Priorizar seção hero e cases.',
    createdAt: yesterday,
    budget: 18000,
    teamMembers: [
      TEAM_ADMIN,
      { id: 'tm2', name: 'Juliana Costa', role: 'UX Designer', email: 'ju@naka.local' },
    ],
    objectives: [
      { id: 'po1', title: 'Wireframes aprovados', status: 'done' },
      { id: 'po2', title: 'Design da home finalizado', status: 'in-progress', dueDate: nextWeek },
      { id: 'po3', title: 'Páginas internas', status: 'pending' },
      { id: 'po4', title: 'Handoff para desenvolvimento', status: 'pending' },
    ],
    documents: [
      { id: 'pd1', title: 'Brief do Projeto', type: 'brief', url: 'https://docs.google.com', createdAt: yesterday },
      { id: 'pd2', title: 'Especificação Técnica v1', type: 'spec', url: 'https://docs.google.com', createdAt: today },
    ],
  },
  {
    id: 'mock-project-2',
    name: 'Campanha Bloom Verão',
    status: 'Ativo',
    stage: 'Planejamento',
    progress: 10,
    dueDate: nextWeek,
    team: 1,
    description: 'Campanha de marketing para o verão da Bloom Foods. Inclui peças para redes sociais, e-mail marketing e materiais para PDV.',
    createdAt: yesterday,
    budget: 9500,
    teamMembers: [
      TEAM_ADMIN,
      { id: 'tm3', name: 'Rafael Melo', role: 'Motion Designer', email: 'rafael@naka.local' },
    ],
    objectives: [
      { id: 'po5', title: 'Definir conceito criativo', status: 'in-progress' },
      { id: 'po6', title: 'Aprovação do briefing pelo cliente', status: 'pending' },
      { id: 'po7', title: 'Produção de peças', status: 'pending' },
    ],
    documents: [
      { id: 'pd3', title: 'Brief Campanha Verão', type: 'brief', url: 'https://docs.google.com', createdAt: yesterday },
    ],
  },
  {
    id: 'mock-project-3',
    name: 'App Vertex v2',
    status: 'Ativo',
    stage: 'Revisão',
    progress: 80,
    dueDate: today,
    team: 3,
    description: 'Segunda versão do aplicativo mobile da Vertex Tech. Novo onboarding, redesign do painel principal e sistema de notificações.',
    notes: 'Revisão final com o CPO na quarta-feira. Foco nos fluxos de notificação.',
    createdAt: yesterday,
    budget: 32000,
    teamMembers: [
      TEAM_ADMIN,
      { id: 'tm4', name: 'Carla Duarte', role: 'UI Designer', email: 'carla@naka.local' },
      { id: 'tm5', name: 'Lucas Faria', role: 'UX Researcher', email: 'lucas@naka.local' },
    ],
    objectives: [
      { id: 'po8', title: 'Redesign onboarding', status: 'done' },
      { id: 'po9', title: 'Novo painel principal', status: 'done' },
      { id: 'po10', title: 'Sistema de notificações', status: 'in-progress', dueDate: today },
      { id: 'po11', title: 'Testes de usabilidade', status: 'pending' },
    ],
    documents: [
      { id: 'pd4', title: 'Research Report Q1', type: 'report', url: 'https://docs.google.com', createdAt: yesterday },
      { id: 'pd5', title: 'Especificação v2.0', type: 'spec', url: 'https://docs.google.com', createdAt: today },
    ],
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'mock-task-1',
    title: 'Criar banner principal do site',
    description: 'Banner hero para a home, formato 1440x800.',
    status: 'todo',
    priority: 'Alta',
    clientId: 'mock-client-1',
    projectId: 'mock-project-1',
    dueDate: today,
    assignees: ['Dev Admin'],
    createdAt: yesterday,
    tags: [],
  },
  {
    id: 'mock-task-2',
    title: 'Post Instagram — lançamento verão',
    description: 'Feed + stories para o lançamento da linha.',
    status: 'in-progress',
    priority: 'Urgente',
    clientId: 'mock-client-2',
    projectId: 'mock-project-2',
    dueDate: today,
    assignees: ['Dev Admin'],
    createdAt: yesterday,
    tags: [],
  },
  {
    id: 'mock-task-3',
    title: 'Revisão de telas do app',
    description: 'Revisar onboarding e tela de perfil.',
    status: 'review',
    priority: 'Alta',
    clientId: 'mock-client-3',
    projectId: 'mock-project-3',
    dueDate: today,
    assignees: ['Dev Admin'],
    createdAt: yesterday,
    tags: [],
  },
  {
    id: 'mock-task-4',
    title: 'Definir paleta de cores Bloom',
    description: 'Paleta para a identidade visual da campanha.',
    status: 'todo',
    priority: 'Média',
    clientId: 'mock-client-2',
    projectId: 'mock-project-2',
    dueDate: nextWeek,
    assignees: [],
    createdAt: yesterday,
    tags: [],
  },
  {
    id: 'mock-task-5',
    title: 'Exportar assets Vertex',
    description: 'Exportar ícones e logos em SVG e PNG.',
    status: 'todo',
    priority: 'Baixa',
    clientId: 'mock-client-3',
    projectId: 'mock-project-3',
    dueDate: nextWeek,
    assignees: [],
    createdAt: yesterday,
    tags: [],
  },
];

export const MOCK_LABELS: TaskLabel[] = [
  { id: 'mock-label-1', title: 'Design', color: '#b7c4ff', iconName: 'solar:palette-linear' },
  { id: 'mock-label-2', title: 'Urgente', color: '#ffb4ab', iconName: 'solar:danger-circle-linear' },
];

const m = (monthsAgo: number, day = 10) => {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  return d.toISOString().slice(0, 10);
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  // Mês atual
  { id: 'mock-tx-1', description: 'Fee Mensal — Acme Studio', amount: 3500, type: 'in', category: 'Retainer', date: today, status: 'paid', clientId: 'mock-client-1', recurring: true, createdAt: today },
  { id: 'mock-tx-2', description: 'Fee Mensal — Bloom Foods', amount: 2800, type: 'in', category: 'Retainer', date: today, status: 'pending', clientId: 'mock-client-2', recurring: true, createdAt: today },
  { id: 'mock-tx-3', description: 'Adobe Creative Cloud', amount: 349, type: 'out', category: 'Software', date: today, status: 'paid', recurring: true, createdAt: today },
  { id: 'mock-tx-4', description: 'Projeto Avulso — Landing Page', amount: 1800, type: 'in', category: 'Projeto Avulso', date: yesterday, status: 'paid', clientId: 'mock-client-1', createdAt: yesterday },
  // 1 mês atrás
  { id: 'mock-tx-5', description: 'Fee Mensal — Acme Studio', amount: 3500, type: 'in', category: 'Retainer', date: m(1), status: 'paid', clientId: 'mock-client-1', recurring: true, createdAt: m(1) },
  { id: 'mock-tx-6', description: 'Fee Mensal — Bloom Foods', amount: 2800, type: 'in', category: 'Retainer', date: m(1), status: 'paid', clientId: 'mock-client-2', recurring: true, createdAt: m(1) },
  { id: 'mock-tx-7', description: 'Figma (equipe)', amount: 180, type: 'out', category: 'Software', date: m(1, 5), status: 'paid', recurring: true, createdAt: m(1, 5) },
  { id: 'mock-tx-8', description: 'Imposto DAS — Simples', amount: 620, type: 'out', category: 'Impostos', date: m(1, 20), status: 'paid', createdAt: m(1, 20) },
  // 2 meses atrás
  { id: 'mock-tx-9', description: 'Fee Mensal — Acme Studio', amount: 3500, type: 'in', category: 'Retainer', date: m(2), status: 'paid', clientId: 'mock-client-1', recurring: true, createdAt: m(2) },
  { id: 'mock-tx-10', description: 'Fee Mensal — Bloom Foods', amount: 2800, type: 'in', category: 'Retainer', date: m(2), status: 'overdue', clientId: 'mock-client-2', recurring: true, createdAt: m(2) },
  { id: 'mock-tx-11', description: 'Consultoria de Marca — TechCo', amount: 4500, type: 'in', category: 'Consultoria', date: m(2, 15), status: 'paid', createdAt: m(2, 15) },
  { id: 'mock-tx-12', description: 'Infraestrutura (servidor)', amount: 290, type: 'out', category: 'Infraestrutura', date: m(2, 8), status: 'paid', recurring: true, createdAt: m(2, 8) },
  // 3 meses atrás
  { id: 'mock-tx-13', description: 'Fee Mensal — Acme Studio', amount: 3500, type: 'in', category: 'Retainer', date: m(3), status: 'paid', clientId: 'mock-client-1', recurring: true, createdAt: m(3) },
  { id: 'mock-tx-14', description: 'Fee Mensal — Bloom Foods', amount: 2800, type: 'in', category: 'Retainer', date: m(3), status: 'paid', clientId: 'mock-client-2', recurring: true, createdAt: m(3) },
  { id: 'mock-tx-15', description: 'Marketing — LinkedIn Ads', amount: 800, type: 'out', category: 'Marketing', date: m(3, 12), status: 'paid', createdAt: m(3, 12) },
  // 4 meses atrás
  { id: 'mock-tx-16', description: 'Fee Mensal — Acme Studio', amount: 3500, type: 'in', category: 'Retainer', date: m(4), status: 'paid', clientId: 'mock-client-1', recurring: true, createdAt: m(4) },
  { id: 'mock-tx-17', description: 'Fee Mensal — Bloom Foods', amount: 2800, type: 'in', category: 'Retainer', date: m(4), status: 'paid', clientId: 'mock-client-2', recurring: true, createdAt: m(4) },
  { id: 'mock-tx-18', description: 'Projeto Extra — Motion Design', amount: 2200, type: 'in', category: 'Extra', date: m(4, 18), status: 'paid', clientId: 'mock-client-1', createdAt: m(4, 18) },
  { id: 'mock-tx-19', description: 'Outros — Material de escritório', amount: 150, type: 'out', category: 'Outros', date: m(4, 22), status: 'paid', createdAt: m(4, 22) },
  // 5 meses atrás
  { id: 'mock-tx-20', description: 'Fee Mensal — Acme Studio', amount: 3500, type: 'in', category: 'Retainer', date: m(5), status: 'paid', clientId: 'mock-client-1', recurring: true, createdAt: m(5) },
  { id: 'mock-tx-21', description: 'Fee Mensal — Bloom Foods', amount: 2800, type: 'in', category: 'Retainer', date: m(5), status: 'paid', clientId: 'mock-client-2', recurring: true, createdAt: m(5) },
  { id: 'mock-tx-22', description: 'Imposto DAS — Simples', amount: 580, type: 'out', category: 'Impostos', date: m(5, 20), status: 'paid', createdAt: m(5, 20) },
];

export const MOCK_BRANDHUBS: BrandHub[] = [
  {
    id: 'mock-hub-1',
    userId: 'dev-admin',
    scope: 'client',
    clientId: 'mock-client-1',
    brandName: 'Acme Studio',
    brandType: 'Estúdio de Design',
    websiteUrl: 'https://acme.studio',
    moodboardUrl: '',
    colors: [
      { id: 'c1', name: 'Roxo Principal', hex: '#7F24FF', purpose: 'Cor primária da marca' },
      { id: 'c2', name: 'Azul Elétrico', hex: '#1178FF', purpose: 'Cor de destaque e CTAs' },
      { id: 'c3', name: 'Azul Profundo', hex: '#0E4A98', purpose: 'Fundos e seções escuras' },
      { id: 'c4', name: 'Violeta Escuro', hex: '#43108A', purpose: 'Gradientes e elementos premium' },
    ],
    fonts: [
      { id: 'f1', name: 'Manrope', type: 'google', googleFontName: 'Manrope' },
      { id: 'f2', name: 'Inter', type: 'google', googleFontName: 'Inter' },
    ],
    logos: [
      { id: 'l1', name: 'Logo Principal', url: 'https://logo.clearbit.com/acme.studio', format: 'png' },
    ],
    keywords: [
      { id: 'k1', word: 'Criatividade', isPrimary: true },
      { id: 'k2', word: 'Inovação', isPrimary: true },
      { id: 'k3', word: 'Design', isPrimary: true },
      { id: 'k4', word: 'Minimalismo', isPrimary: false },
      { id: 'k5', word: 'Tecnologia', isPrimary: false },
    ],
    identity: {
      nicho: 'Design e Branding para startups tech',
      publicoAlvo: 'Fundadores e CTOs de startups B2B',
      tomDeVoz: 'Profissional, direto e inspirador. Sem jargão excessivo.',
      slogan: 'Design that works.',
      concorrentes: 'Pentagram, Wolff Olins, Moving Brands',
      restricoesVisuais: 'Nunca usar rosa ou laranja. Evitar fontes serifadas.',
      proposta: 'Transformar ideias complexas em identidades visuais claras e memoráveis.',
      objetivo: 'Tornar-se a referência em design estratégico para startups tech no Brasil.',
    },
    figmaLink: '',
    socialLinks: {
      instagram: 'https://instagram.com/acmestudio',
      linkedin: 'https://linkedin.com/company/acmestudio',
      behance: 'https://behance.net/acmestudio',
    },
  },
  {
    id: 'mock-hub-2',
    userId: 'dev-admin',
    scope: 'client',
    clientId: 'mock-client-2',
    brandName: 'Bloom Foods',
    brandType: 'Marca de Alimentação Saudável',
    websiteUrl: 'https://bloom.com',
    moodboardUrl: '',
    colors: [
      { id: 'c5', name: 'Verde Folha', hex: '#2D8A4E', purpose: 'Cor principal — saúde e natureza' },
      { id: 'c6', name: 'Creme', hex: '#F5ECD7', purpose: 'Fundos e espaços negativos' },
      { id: 'c7', name: 'Terra', hex: '#A0522D', purpose: 'Elementos de destaque e ícones' },
    ],
    fonts: [
      { id: 'f3', name: 'Playfair Display', type: 'google', googleFontName: 'Playfair Display' },
      { id: 'f4', name: 'Source Sans Pro', type: 'google', googleFontName: 'Source Sans 3' },
    ],
    logos: [],
    keywords: [
      { id: 'k6', word: 'Natural', isPrimary: true },
      { id: 'k7', word: 'Saudável', isPrimary: true },
      { id: 'k8', word: 'Sustentável', isPrimary: false },
      { id: 'k9', word: 'Sabor', isPrimary: false },
    ],
    identity: {
      nicho: 'Alimentos naturais e orgânicos para o dia a dia',
      publicoAlvo: 'Adultos 25-45 anos, conscientes sobre saúde e meio ambiente',
      tomDeVoz: 'Caloroso, autêntico e encorajador. Como um amigo que cuida de você.',
      slogan: 'Coma bem, viva bem.',
      concorrentes: 'Orgânico Natural, Mundo Verde, Natural da Terra',
      restricoesVisuais: 'Evitar vermelho e preto. Nada que remeta a fast food.',
      proposta: 'Tornar a alimentação saudável acessível e deliciosa para todos.',
      objetivo: 'Liderar o mercado de alimentos naturais no Sudeste brasileiro.',
    },
    figmaLink: '',
    socialLinks: {
      instagram: 'https://instagram.com/bloomfoods',
    },
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'mock-notif-1',
    title: 'Modo Mock ativo',
    message: 'Você está usando dados locais de desenvolvimento. Nenhuma escrita vai ao Firestore.',
    read: false,
    createdAt: new Date().toISOString(),
  },
];
