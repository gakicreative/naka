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
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        optional: 'Opcional.',
        updated: 'Atualizado',
        active_badge: 'Ativo',
        currentMonth: 'Mês Atual',
        viewAll: 'Ver todos',
        saving: 'Salvando...',
        status: {
          late: 'Atrasado'
        }
      },
      layout: {
        logout: 'Trocar perfil',
        search: 'Buscar clientes, tarefas...',
        roles: {
          admin: 'Admin',
          socio: 'Sócio',
          seeder: 'Funcionário',
          cliente: 'Cliente'
        }
      },
      login: {
        inviteMessage: 'Você foi convidado para participar da equipe. Faça login para aceitar.',
        subtitle: 'Faça login para acessar o sistema',
        continueWithGoogle: 'Continuar com Google',
        success: 'Login realizado com sucesso!',
        error: 'Erro ao fazer login. Tente novamente.'
      },
      notifications: {
        title: 'Notificações',
        clearAll: 'Limpar todas',
        markRead: 'Marcar como lida',
        empty: 'Nenhuma notificação',
        emptySubtitle: 'Você está em dia com todas as suas tarefas e atualizações.'
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
          clearCacheDesc: 'Apaga os dados armazenados localmente no navegador. Isso não afeta seus dados na nuvem.',
          clearCacheSuccess: 'Cache local apagado com sucesso! Recarregando...'
        },
        labels: {
          manage: 'Gerenciar',
          noLabels: 'Nenhuma etiqueta criada ainda.',
          createFirst: 'Criar primeira etiqueta'
        },
        unavailable: 'Recurso indisponível no momento'
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
        noClients: 'Nenhum cliente encontrado',
        filter: 'Filtrar',
        search: 'Buscar clientes...',
        contactLabel: 'Contato',
        statusLabel: 'Status',
        editTitle: 'Editar cliente',
        companyName: 'Nome da Empresa',
        companyNamePlaceholder: 'Ex: Acme Corp',
        website: 'Site da Empresa',
        websitePlaceholder: 'https://empresa.com.br',
        industry: 'Setor / Indústria',
        industryPlaceholder: 'Ex: Tecnologia',
        maxTasks: 'Máx. Tarefas Simultâneas',
        contact: 'Contato Principal',
        contactPlaceholder: 'Nome da pessoa',
        email: 'Email',
        emailPlaceholder: 'contato@empresa.com',
        phone: 'Telefone',
        phonePlaceholder: '(11) 99999-9999',
        addClient: 'Adicionar Cliente',
        editClient: 'Editar Cliente',
        saveChanges: 'Salvar Alterações',
        added: 'Cliente adicionado com sucesso!',
        updated: 'Cliente atualizado com sucesso!',
        logoUpdated: 'Logo atualizado com sucesso!',
        errorUpdateLogo: 'Erro ao atualizar logo'
      },
      projects: {
        title: 'Projetos',
        new: 'Novo Projeto',
        internalProject: 'Projeto Interno',
        noProjects: 'Nenhum projeto encontrado',
        nameLabel: 'Nome do Projeto',
        namePlaceholder: 'Ex: Redesign do Site',
        descriptionLabel: 'Descrição',
        descriptionPlaceholder: 'Descreva o objetivo do projeto...',
        initialStage: 'Fase Inicial',
        dueDate: 'Prazo Estimado',
        creating: 'Criando...',
        create: 'Criar Projeto',
        created: 'Projeto criado com sucesso!',
        errorCreate: 'Erro ao criar projeto'
      },
      task: {
        new: 'Nova Tarefa',
        titleLabel: 'Título',
        titlePlaceholder: 'Ex: Criar post para Instagram',
        titleRequired: 'O título da tarefa é obrigatório',
        descriptionLabel: 'Descrição',
        descriptionPlaceholder: 'Detalhes da tarefa...',
        clientLabel: 'Cliente',
        selectClient: 'Selecione um cliente',
        projectLabel: 'Projeto',
        selectProject: 'Selecione um projeto',
        priorityLabel: 'Prioridade',
        create: 'Criar Tarefa',
        created: 'Tarefa criada com sucesso!',
        errorCreate: 'Erro ao criar tarefa'
      },
      labels: {
        manageTitle: 'Gerenciar Etiquetas',
        newPlaceholder: 'Nova etiqueta...',
        created: 'Etiqueta criada com sucesso!',
        errorCreate: 'Erro ao criar etiqueta',
        deleted: 'Etiqueta excluída com sucesso!',
        errorDelete: 'Erro ao excluir etiqueta',
        noLabels: 'Nenhuma etiqueta criada'
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
        internalProject: 'Projeto Interno',
        confirmDeleteTask: 'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
        confirmDeleteComment: 'Tem certeza que deseja excluir este comentário?',
        taskDeleted: 'Tarefa excluída com sucesso.',
        taskArchived: 'Tarefa arquivada com sucesso!',
        taskCompleted: 'Tarefa concluída! Movida para arquivados.',
        taskDone: 'Tarefa concluída! ✓',
        taskReopened: 'Tarefa reaberta!',
        titleUpdated: 'Título atualizado',
        onlyImages: 'Apenas imagens são permitidas.',
        imageTooLarge: 'Imagem muito grande. Máximo: 10 MB.',
        imageUploaded: 'Imagem enviada!',
        imageError: 'Erro ao processar a imagem. Tente novamente.',
        noDate: 'Sem data',
        noComments: 'Nenhum comentário ainda. Clique na imagem para adicionar.',
        taskDetailsPlaceholder: 'Detalhes da tarefa...',
        taskChat: 'Chat da Tarefa',
        searchPlaceholder: 'Pesquisar tarefas...',
        noArchivedTasks: 'Nenhuma tarefa arquivada',
        archivedInfo: 'Tarefas concluídas ou arquivadas aparecerão aqui.',
        completeTask: 'Concluir Tarefa',
        deleteTask: 'Excluir Tarefa',
        archiveTask: 'Arquivar Tarefa',
        reopenTask: 'Reabrir tarefa',
        reopen: 'Reabrir'
      },
      portal: {
        title: 'Portal do Cliente',
        myBrand: 'Minha Marca',
        deliverables: 'Entregáveis',
        noBrandHub: 'Nenhum Brand Hub configurado',
        requests: 'Solicitações',
        logout: 'Sair',
        colorPalette: 'Paleta de Cores',
        typography: 'Tipografia',
        logos: 'Logos',
        openFigma: 'Abrir no Figma →',
        requestTitle: 'Solicitar Nova Tarefa',
        taskSlots: 'Você tem {{current}} de {{max}} tarefas simultâneas em andamento.',
        newRequest: 'Nova Solicitação',
        yourRequests: 'Suas Solicitações',
        noRequests: 'Nenhuma solicitação encontrada.',
        deadline: 'Prazo: {{date}}',
        deliverablesSoon: 'Entregas estarão disponíveis em breve.',
        status: {
          todo: 'Na Fila',
          inProgress: 'Em Produção',
          review: 'Aprovação',
          done: 'Concluído'
        }
      },
      requestTask: {
        title: 'Nova Solicitação de Tarefa',
        whatLabel: 'O que você precisa?',
        whatPlaceholder: 'Ex: Criar banner para o Instagram',
        detailsLabel: 'Detalhes (Opcional)',
        detailsPlaceholder: 'Descreva os detalhes, referências ou informações importantes...',
        submit: 'Enviar Solicitação',
        success: 'Solicitação enviada com sucesso!'
      },
      brandSuggestion: {
        title: 'Marca Encontrada',
        description: 'Encontramos a identidade visual de <strong>{{name}}</strong>. Deseja aplicar?',
        ignore: 'Ignorar',
        apply: 'Aplicar'
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
      common: {
        save: 'Save',
        cancel: 'Cancel',
        optional: 'Optional.',
        updated: 'Updated',
        active_badge: 'Active',
        currentMonth: 'Current Month',
        viewAll: 'View all',
        saving: 'Saving...',
        status: {
          late: 'Late'
        }
      },
      layout: {
        logout: 'Switch profile',
        search: 'Search clients, tasks...',
        roles: {
          admin: 'Admin',
          socio: 'Partner',
          seeder: 'Employee',
          cliente: 'Client'
        }
      },
      login: {
        inviteMessage: 'You have been invited to join the team. Sign in to accept.',
        subtitle: 'Sign in to access the system',
        continueWithGoogle: 'Continue with Google',
        success: 'Login successful!',
        error: 'Login error. Please try again.'
      },
      notifications: {
        title: 'Notifications',
        clearAll: 'Clear all',
        markRead: 'Mark as read',
        empty: 'No notifications',
        emptySubtitle: 'You are up to date with all your tasks and updates.'
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
          clearCacheDesc: 'Clears locally stored data in the browser. This does not affect your cloud data.',
          clearCacheSuccess: 'Local cache cleared successfully! Reloading...'
        },
        labels: {
          manage: 'Manage',
          noLabels: 'No labels created yet.',
          createFirst: 'Create first label'
        },
        unavailable: 'Feature currently unavailable'
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
        noClients: 'No clients found',
        filter: 'Filter',
        search: 'Search clients...',
        contactLabel: 'Contact',
        statusLabel: 'Status',
        editTitle: 'Edit client',
        companyName: 'Company Name',
        companyNamePlaceholder: 'E.g.: Acme Corp',
        website: 'Company Website',
        websitePlaceholder: 'https://company.com',
        industry: 'Industry',
        industryPlaceholder: 'E.g.: Technology',
        maxTasks: 'Max Concurrent Tasks',
        contact: 'Main Contact',
        contactPlaceholder: 'Person name',
        email: 'Email',
        emailPlaceholder: 'contact@company.com',
        phone: 'Phone',
        phonePlaceholder: '(11) 99999-9999',
        addClient: 'Add Client',
        editClient: 'Edit Client',
        saveChanges: 'Save Changes',
        added: 'Client added successfully!',
        updated: 'Client updated successfully!',
        logoUpdated: 'Logo updated successfully!',
        errorUpdateLogo: 'Error updating logo'
      },
      projects: {
        title: 'Projects',
        new: 'New Project',
        internalProject: 'Internal Project',
        noProjects: 'No projects found',
        nameLabel: 'Project Name',
        namePlaceholder: 'E.g.: Website Redesign',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'Describe the project objective...',
        initialStage: 'Initial Stage',
        dueDate: 'Estimated Due Date',
        creating: 'Creating...',
        create: 'Create Project',
        created: 'Project created successfully!',
        errorCreate: 'Error creating project'
      },
      task: {
        new: 'New Task',
        titleLabel: 'Title',
        titlePlaceholder: 'E.g.: Create Instagram post',
        titleRequired: 'Task title is required',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'Task details...',
        clientLabel: 'Client',
        selectClient: 'Select a client',
        projectLabel: 'Project',
        selectProject: 'Select a project',
        priorityLabel: 'Priority',
        create: 'Create Task',
        created: 'Task created successfully!',
        errorCreate: 'Error creating task'
      },
      labels: {
        manageTitle: 'Manage Labels',
        newPlaceholder: 'New label...',
        created: 'Label created successfully!',
        errorCreate: 'Error creating label',
        deleted: 'Label deleted successfully!',
        errorDelete: 'Error deleting label',
        noLabels: 'No labels created'
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
        internalProject: 'Internal Project',
        confirmDeleteTask: 'Are you sure you want to delete this task? This action cannot be undone.',
        confirmDeleteComment: 'Are you sure you want to delete this comment?',
        taskDeleted: 'Task deleted successfully.',
        taskArchived: 'Task archived successfully!',
        taskCompleted: 'Task completed! Moved to archived.',
        taskDone: 'Task completed! ✓',
        taskReopened: 'Task reopened!',
        titleUpdated: 'Title updated',
        onlyImages: 'Only images are allowed.',
        imageTooLarge: 'Image too large. Maximum: 10 MB.',
        imageUploaded: 'Image uploaded!',
        imageError: 'Error processing the image. Please try again.',
        noDate: 'No date',
        noComments: 'No comments yet. Click on the image to add.',
        taskDetailsPlaceholder: 'Task details...',
        taskChat: 'Task Chat',
        searchPlaceholder: 'Search tasks...',
        noArchivedTasks: 'No archived tasks',
        archivedInfo: 'Completed or archived tasks will appear here.',
        completeTask: 'Complete Task',
        deleteTask: 'Delete Task',
        archiveTask: 'Archive Task',
        reopenTask: 'Reopen task',
        reopen: 'Reopen'
      },
      portal: {
        title: 'Client Portal',
        myBrand: 'My Brand',
        deliverables: 'Deliverables',
        noBrandHub: 'No Brand Hub configured',
        requests: 'Requests',
        logout: 'Sign out',
        colorPalette: 'Color Palette',
        typography: 'Typography',
        logos: 'Logos',
        openFigma: 'Open in Figma →',
        requestTitle: 'Request New Task',
        taskSlots: 'You have {{current}} of {{max}} concurrent tasks in progress.',
        newRequest: 'New Request',
        yourRequests: 'Your Requests',
        noRequests: 'No requests found.',
        deadline: 'Deadline: {{date}}',
        deliverablesSoon: 'Deliverables will be available soon.',
        status: {
          todo: 'In Queue',
          inProgress: 'In Production',
          review: 'Approval',
          done: 'Completed'
        }
      },
      requestTask: {
        title: 'New Task Request',
        whatLabel: 'What do you need?',
        whatPlaceholder: 'E.g.: Create an Instagram banner',
        detailsLabel: 'Details (Optional)',
        detailsPlaceholder: 'Describe details, references, or important information...',
        submit: 'Submit Request',
        success: 'Request submitted successfully!'
      },
      brandSuggestion: {
        title: 'Brand Found',
        description: 'We found the visual identity of <strong>{{name}}</strong>. Would you like to apply it?',
        ignore: 'Ignore',
        apply: 'Apply'
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
