import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      nav: {
        home: 'Início',
        clients: 'Clientes',
        tasks: 'Tarefas',
        brandHub: 'Brand Hub',
        finances: 'Finanças',
        projects: 'Projetos',
        settings: 'Configurações'
      },
      settings: {
        title: 'Configurações',
        subtitle: 'Gerencie suas preferências e configurações da conta',
        tabs: {
          profile: 'Perfil',
          visual: 'Aparência',
          permissions: 'Permissões',
          security: 'Segurança',
          notifications: 'Notificações',
          localization: 'Localização',
          labels: 'Etiquetas',
          team: 'Equipe'
        },
        profile: {
          title: 'Perfil',
          avatar: 'Avatar',
          avatarHint: 'Sua foto de perfil',
          nameLabel: 'Nome de exibição',
          roleLabel: 'Cargo',
          saveSuccess: 'Perfil salvo com sucesso!'
        },
        visual: {
          title: 'Aparência',
          system: 'Sistema',
          dark: 'Escuro',
          light: 'Claro',
          hint: 'Escolha o tema de sua preferência'
        },
        localization: {
          title: 'Localização',
          subtitle: 'Idioma e região',
          portuguese: 'Português',
          english: 'Inglês',
          changed: 'Idioma alterado com sucesso!'
        },
        team: {
          newPartner: 'Novo Sócio',
          newSeeder: 'Novo Funcionário',
          invitesGenerated: 'Convites Gerados',
          noInvites: 'Nenhum convite gerado ainda.',
          used: 'Usado',
          pending: 'Pendente'
        },
        danger: {
          title: 'Zona de Perigo',
          clearCache: 'Limpar Cache Local',
          clearCacheDesc: 'Apaga os dados armazenados localmente no navegador. Isso não afeta seus dados na nuvem.'
        },
        labels: {
          manage: 'Gerenciar',
          noLabels: 'Nenhuma etiqueta criada ainda.',
          createFirst: 'Criar primeira etiqueta'
        },
        unavailable: 'Recurso indisponível no momento'
      },
      common: {
        save: 'Salvar',
        updated: 'Atualizado',
        active_badge: 'Ativo',
        currentMonth: 'Mês Atual',
        viewAll: 'Ver todos',
        status: {
          late: 'Atrasado'
        }
      },
      dashboard: {
        greeting: 'Olá, {{name}}',
        subtitle: 'Bem-vindo de volta ao seu painel',
        activeProjects: 'Projetos Ativos',
        pendingTasks: 'Tarefas Pendentes',
        activeClients: 'Clientes Ativos',
        monthlyRevenue: 'Receita Mensal',
        priorityTasks: 'Tarefas Prioritárias',
        noProject: 'Sem projeto',
        noUrgentTasks: 'Nenhuma tarefa urgente',
        featuredProjects: 'Projetos em Destaque',
        progress: 'Progresso',
        noFeaturedProjects: 'Nenhum projeto em destaque',
        quickActions: 'Ações Rápidas',
        newClient: 'Novo Cliente',
        receivables: 'A Receber',
        noPendingInvoices: 'Nenhuma fatura pendente'
      },
      clients: {
        title: 'Clientes',
        subtitle: 'Gerencie seus clientes e contratos',
        new: 'Novo Cliente',
        totalClients: 'Total de Clientes',
        activeClients: 'Clientes Ativos',
        addFirst: 'Adicionar primeiro cliente',
        monthlyRetainer: 'Fee Mensal',
        openKanban: 'Abrir Kanban',
        noClients: 'Nenhum cliente encontrado'
      },
      projects: {
        title: 'Projetos',
        new: 'Novo Projeto',
        internalProject: 'Projeto Interno',
        noProjects: 'Nenhum projeto encontrado'
      },
      tasks: {
        title: 'Tarefas de Hoje',
        subtitle: 'Veja o que está agendado para o dia',
        todayCount: 'hoje',
        urgentCount: 'urgentes',
        viewKanban: 'Ver Kanban',
        searchPlaceholder: 'Buscar cliente...',
        noTasksToday: 'Nenhuma tarefa para hoje. Aproveite!',
        tasksLabel: 'tarefa(s)'
      },
      kanban: {
        activeTasks: 'tarefas ativas',
        internalProject: 'Projeto Interno'
      },
      portal: {
        title: 'Portal do Cliente',
        myBrand: 'Minha Marca',
        deliverables: 'Entregáveis',
        noBrandHub: 'Nenhum Brand Hub configurado'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        clients: 'Clients',
        tasks: 'Tasks',
        brandHub: 'Brand Hub',
        finances: 'Finances',
        projects: 'Projects',
        settings: 'Settings'
      },
      settings: {
        title: 'Settings',
        subtitle: 'Manage your preferences and account settings',
        tabs: {
          profile: 'Profile',
          visual: 'Appearance',
          permissions: 'Permissions',
          security: 'Security',
          notifications: 'Notifications',
          localization: 'Localization',
          labels: 'Labels',
          team: 'Team'
        },
        profile: {
          title: 'Profile',
          avatar: 'Avatar',
          avatarHint: 'Your profile picture',
          nameLabel: 'Display Name',
          roleLabel: 'Role',
          saveSuccess: 'Profile saved successfully!'
        },
        visual: {
          title: 'Appearance',
          system: 'System',
          dark: 'Dark',
          light: 'Light',
          hint: 'Choose your preferred theme'
        },
        localization: {
          title: 'Localization',
          subtitle: 'Language and region',
          portuguese: 'Portuguese',
          english: 'English',
          changed: 'Language changed successfully!'
        },
        team: {
          newPartner: 'New Partner',
          newSeeder: 'New Employee',
          invitesGenerated: 'Generated Invites',
          noInvites: 'No invites generated yet.',
          used: 'Used',
          pending: 'Pending'
        },
        danger: {
          title: 'Danger Zone',
          clearCache: 'Clear Local Cache',
          clearCacheDesc: 'Clears locally stored data in the browser. This does not affect your cloud data.'
        },
        labels: {
          manage: 'Manage',
          noLabels: 'No labels created yet.',
          createFirst: 'Create first label'
        },
        unavailable: 'Feature currently unavailable'
      },
      common: {
        save: 'Save',
        updated: 'Updated',
        active_badge: 'Active',
        currentMonth: 'Current Month',
        viewAll: 'View all',
        status: {
          late: 'Late'
        }
      },
      dashboard: {
        greeting: 'Hello, {{name}}',
        subtitle: 'Welcome back to your dashboard',
        activeProjects: 'Active Projects',
        pendingTasks: 'Pending Tasks',
        activeClients: 'Active Clients',
        monthlyRevenue: 'Monthly Revenue',
        priorityTasks: 'Priority Tasks',
        noProject: 'No project',
        noUrgentTasks: 'No urgent tasks',
        featuredProjects: 'Featured Projects',
        progress: 'Progress',
        noFeaturedProjects: 'No featured projects',
        quickActions: 'Quick Actions',
        newClient: 'New Client',
        receivables: 'Receivables',
        noPendingInvoices: 'No pending invoices'
      },
      clients: {
        title: 'Clients',
        subtitle: 'Manage your clients and retainers',
        new: 'New Client',
        totalClients: 'Total Clients',
        activeClients: 'Active Clients',
        addFirst: 'Add first client',
        monthlyRetainer: 'Monthly Retainer',
        openKanban: 'Open Kanban',
        noClients: 'No clients found'
      },
      projects: {
        title: 'Projects',
        new: 'New Project',
        internalProject: 'Internal Project',
        noProjects: 'No projects found'
      },
      tasks: {
        title: "Today's Tasks",
        subtitle: 'See what is scheduled for today',
        todayCount: 'today',
        urgentCount: 'urgent',
        viewKanban: 'View Kanban',
        searchPlaceholder: 'Search client...',
        noTasksToday: 'No tasks for today. Enjoy!',
        tasksLabel: 'task(s)'
      },
      kanban: {
        activeTasks: 'active tasks',
        internalProject: 'Internal Project'
      },
      portal: {
        title: 'Client Portal',
        myBrand: 'My Brand',
        deliverables: 'Deliverables',
        noBrandHub: 'No Brand Hub configured'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
