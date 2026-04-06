import { create } from 'zustand';
import { persist } from 'zustand/middleware';

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status}`);
  return res.json();
}

export type TaskViewType = 'kanban' | 'list' | 'calendar' | 'timeline' | 'board-by-client';

export interface UserSession {
  role: 'admin' | 'socio' | 'lider' | 'seeder' | 'cliente';
  name: string;
  email?: string;
  activeClientId?: string;
  orgId?: string;
  taskView?: TaskViewType | null;
  orgLogoUrl?: string | null;
  orgName?: string;
}

export interface ClientObjective {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'done';
}

export interface ClientContract {
  startDate: string;
  endDate: string;
  value: number;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
  description?: string;
}

export interface ClientInvoice {
  id: string;
  number: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  documentUrl?: string;
}

export interface ClientMarketingDoc {
  id: string;
  title: string;
  type: 'brief' | 'report' | 'presentation' | 'other';
  url: string;
  createdAt: string;
}

export interface ClientStrategy {
  goals?: string;
  positioning?: string;
  channels?: string;
  kpis?: string;
  notes?: string;
}

export interface ClientLegalInfo {
  legalName?: string;
  cnpj?: string;
  address?: string;
  taxRegime?: string;
  billingEmail?: string;
}

export interface ClientContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary?: boolean;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  status: 'Ativo' | 'Inativo';
  logo: string;
  contact: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  figmaLink?: string;
  createdAt?: string;
  retainer?: {
    value: number;
    hours: number;
    loggedHours: number;
    renewalDate: string;
    healthScore: number;
    focus: string[];
  };
  contacts?: ClientContact[];
  maxActiveTasks?: number;
  objectives?: ClientObjective[];
  contract?: ClientContract;
  invoices?: ClientInvoice[];
  marketingDocs?: ClientMarketingDoc[];
  strategy?: ClientStrategy;
  legalInfo?: ClientLegalInfo;
}

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  purpose?: string;
}

export interface BrandFont {
  id: string;
  name: string;
  type: 'google' | 'file' | 'link';
  googleFontName?: string;
  fileUrl?: string;
  linkUrl?: string;
}

export interface BrandLogo {
  id: string;
  name: string;
  url: string;
  format?: string;
}

export interface BrandKeyword {
  id: string;
  word: string;
  isPrimary: boolean;
}

export interface BrandSocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  pinterest?: string;
  behance?: string;
  dribbble?: string;
}

export interface BrandHub {
  id: string;
  userId: string;
  scope: 'client' | 'project';
  clientId?: string;
  projectId?: string;
  brandName: string;
  brandType?: string;
  moodboardUrl?: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  logos: BrandLogo[];
  keywords: BrandKeyword[];
  identity: {
    nicho: string;
    publicoAlvo: string;
    tomDeVoz: string;
    slogan: string;
    concorrentes: string;
    restricoesVisuais: string;
    proposta?: string;
    objetivo?: string;
  };
  socialLinks?: BrandSocialLinks;
  figmaLink: string;
  websiteUrl?: string;
}

export interface Deliverable {
  id: string;
  userId: string;
  clientId: string;
  title: string;
  type: string;
  date: string;
  status: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface ProjectObjective {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  dueDate?: string;
}

export interface ProjectDoc {
  id: string;
  title: string;
  type: 'brief' | 'spec' | 'report' | 'other';
  url: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'Ativo' | 'Pausado' | 'Concluído';
  stage: 'Planejamento' | 'Em Andamento' | 'Revisão' | 'Finalizado';
  progress: number;
  dueDate: string;
  team: number;
  description?: string;
  createdAt?: string;
  availableTags?: string[];
  teamMembers?: ProjectMember[];
  objectives?: ProjectObjective[];
  documents?: ProjectDoc[];
  notes?: string;
  budget?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  projectId?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'archived';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  startDate?: string;
  dueDate: string;
  assignees: string[];
  createdAt?: string;
  comments?: number;
  attachments?: number;
  date?: string;
  tags?: string[];
  internalPriority?: string;
  completedAt?: string;
  designSpecs?: {
    creativeDirection?: string;
    sizes?: string;
    fileTypes?: string;
  };
  subTaskIds?: string[];
  checklist?: { id: string; text: string; done: boolean }[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  category: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  clientId?: string;
  projectId?: string;
  recurring?: boolean;
  createdAt?: string;
}

export interface TaskLabel {
  id: string;
  title: string;
  color: string;   // hex, e.g. "#34d399"
  iconName: string; // Solar icon name, e.g. "solar:check-circle-linear"
}

export interface Pin {
  id: string;
  taskId: string;
  imageUrl: string;
  x: number;
  y: number;
  text: string;
  resolved: boolean;
  author: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  taskId: string;
  clientId: string;
  rating: number;   // 1–5
  comment?: string;
  createdAt: string;
}

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'socio' | 'lider' | 'seeder';
  leaderId?: string;
  createdAt?: string;
}

const genId = () => crypto.randomUUID();
const MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

interface AppState {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  brandhubs: BrandHub[];
  pins: Pin[];
  labels: TaskLabel[];
  notifications: Notification[];

  // Clients
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Projects
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Brand Hubs
  upsertBrandHub: (hub: Omit<BrandHub, 'id'> & { id?: string }) => void;
  updateBrandHub: (id: string, hub: Partial<BrandHub>) => void;
  deleteBrandHub: (id: string) => void;

  // Pins (visual feedback on images)
  addPin: (pin: Omit<Pin, 'id' | 'createdAt'>) => void;
  updatePin: (id: string, data: Partial<Pin>) => void;
  deletePin: (id: string) => void;

  // Notifications (read state only — notifications are derived from data)
  readNotificationIds: string[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  setNotifications: (notifications: Notification[]) => void;

  // Session & Language
  session: UserSession | null;
  setSession: (session: UserSession | null) => void;
  updateTaskView: (view: TaskViewType) => void;
  language: 'pt-BR' | 'en-US';
  setLanguage: (lang: 'pt-BR' | 'en-US') => void;

  // Labels
  addLabel: (label: Omit<TaskLabel, 'id'>) => void;
  updateLabel: (id: string, label: Partial<TaskLabel>) => void;
  deleteLabel: (id: string) => void;
  setLabels: (labels: TaskLabel[]) => void;

  // Feedbacks (enviados pelos clientes sobre tarefas concluídas)
  feedbacks: Feedback[];
  setFeedbacks: (feedbacks: Feedback[]) => void;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => Promise<void>;
  updateFeedback: (id: string, data: Partial<Feedback>) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;

  // Team users: atualizar leaderId
  updateTeamUser: (id: string, leaderId: string | null) => Promise<void>;

  // Team users (read-only from server)
  teamUsers: TeamUser[];
  setTeamUsers: (users: TeamUser[]) => void;

  // Bulk setters (used by AppProvider seed)
  setPins: (pins: Pin[]) => void;
  setClients: (clients: Client[]) => void;
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBrandHubs: (hubs: BrandHub[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: [],
      projects: [],
      tasks: [],
      transactions: [],
      brandhubs: [],
      pins: [],
      labels: [],
      notifications: [],
      feedbacks: [],
      teamUsers: [],
      session: null,
      language: 'pt-BR',
      setSession: (session) => set({ session }),
      updateTaskView: (view) => set(s => ({ session: s.session ? { ...s.session, taskView: view } : s.session })),
      setLanguage: (language) => set({ language }),

      addPin: async (pin) => {
        const id = genId();
        const newPin = { ...pin, id, createdAt: new Date().toISOString() };
        if (MOCK) { set(s => ({ pins: [...s.pins, newPin] })); return; }
        await api('POST', '/api/pins', newPin);
        set(s => ({ pins: [...s.pins, newPin] }));
      },
      updatePin: async (id, data) => {
        if (MOCK) { set(s => ({ pins: s.pins.map(p => p.id === id ? { ...p, ...data } : p) })); return; }
        await api('PATCH', `/api/pins/${id}`, data);
        set(s => ({ pins: s.pins.map(p => p.id === id ? { ...p, ...data } : p) }));
      },
      deletePin: async (id) => {
        if (MOCK) { set(s => ({ pins: s.pins.filter(p => p.id !== id) })); return; }
        await api('DELETE', `/api/pins/${id}`);
        set(s => ({ pins: s.pins.filter(p => p.id !== id) }));
      },

      readNotificationIds: [],
      markNotificationAsRead: async (id) => {
        if (MOCK) { set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })); return; }
        await api('PATCH', `/api/notifications/${id}`, { read: true });
        set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
      },
      clearNotifications: async () => {
        if (MOCK) { set({ notifications: [] }); return; }
        const notifications = get().notifications;
        await Promise.all(notifications.map(n => api('DELETE', `/api/notifications/${n.id}`)));
        set({ notifications: [] });
      },
      setNotifications: (notifications) => set({ notifications }),

      addLabel: async (label) => {
        const id = genId();
        const newLabel = { ...label, id };
        if (MOCK) { set(s => ({ labels: [...s.labels, newLabel] })); return; }
        await api('POST', '/api/labels', newLabel);
        set(s => ({ labels: [...s.labels, newLabel] }));
      },
      updateLabel: async (id, label) => {
        if (MOCK) { set(s => ({ labels: s.labels.map(l => l.id === id ? { ...l, ...label } : l) })); return; }
        await api('PATCH', `/api/labels/${id}`, label);
        set(s => ({ labels: s.labels.map(l => l.id === id ? { ...l, ...label } : l) }));
      },
      deleteLabel: async (id) => {
        const tasks = get().tasks;
        if (MOCK) {
          set(s => ({
            labels: s.labels.filter(l => l.id !== id),
            tasks: s.tasks.map(t => t.tags?.includes(id) ? { ...t, tags: t.tags.filter(tag => tag !== id) } : t),
          }));
          return;
        }
        await api('DELETE', `/api/labels/${id}`);
        set(s => ({ labels: s.labels.filter(l => l.id !== id) }));
        await Promise.all(
          tasks
            .filter(t => t.tags?.includes(id))
            .map(t => api('PATCH', `/api/tasks/${t.id}`, { tags: t.tags!.filter(tag => tag !== id) }))
        );
        set(s => ({
          tasks: s.tasks.map(t => t.tags?.includes(id) ? { ...t, tags: t.tags!.filter(tag => tag !== id) } : t),
        }));
      },
      setLabels: (labels) => set({ labels }),

      setFeedbacks: (feedbacks) => set({ feedbacks }),
      addFeedback: async (feedback) => {
        const id = genId();
        const newFeedback: Feedback = { ...feedback, id, createdAt: new Date().toISOString() };
        if (MOCK) { set(s => ({ feedbacks: [...s.feedbacks, newFeedback] })); return; }
        await api('POST', '/api/feedbacks', newFeedback);
        set(s => ({ feedbacks: [...s.feedbacks, newFeedback] }));
      },
      updateFeedback: async (id, data) => {
        if (MOCK) { set(s => ({ feedbacks: s.feedbacks.map(f => f.id === id ? { ...f, ...data } : f) })); return; }
        await api('PATCH', `/api/feedbacks/${id}`, data);
        set(s => ({ feedbacks: s.feedbacks.map(f => f.id === id ? { ...f, ...data } : f) }));
      },
      deleteFeedback: async (id) => {
        if (MOCK) { set(s => ({ feedbacks: s.feedbacks.filter(f => f.id !== id) })); return; }
        await api('DELETE', `/api/feedbacks/${id}`);
        set(s => ({ feedbacks: s.feedbacks.filter(f => f.id !== id) }));
      },
      setTeamUsers: (teamUsers) => set({ teamUsers }),
      updateTeamUser: async (id, leaderId) => {
        if (MOCK) { set(s => ({ teamUsers: s.teamUsers.map(u => u.id === id ? { ...u, leaderId: leaderId ?? undefined } : u) })); return; }
        await api('PATCH', `/api/team/${id}`, { leaderId });
        set(s => ({ teamUsers: s.teamUsers.map(u => u.id === id ? { ...u, leaderId: leaderId ?? undefined } : u) }));
      },

      setPins: (pins) => set({ pins }),
      setClients: (clients) => set({ clients }),
      setProjects: (projects) => set({ projects }),
      setTasks: (tasks) => set({ tasks }),
      setTransactions: (transactions) => set({ transactions }),
      setBrandHubs: (brandhubs) => set({ brandhubs }),

      addClient: async (client) => {
        const id = genId();
        const newClient = { ...client, id };
        if (MOCK) { set(s => ({ clients: [...s.clients, newClient] })); return; }
        await api('POST', '/api/clients', newClient);
        set(s => ({ clients: [...s.clients, newClient] }));
      },
      updateClient: async (id, client) => {
        if (MOCK) { set(s => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...client } : c) })); return; }
        await api('PATCH', `/api/clients/${id}`, client);
        set(s => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...client } : c) }));
      },
      deleteClient: async (id) => {
        if (MOCK) { set(s => ({ clients: s.clients.filter(c => c.id !== id) })); return; }
        await api('DELETE', `/api/clients/${id}`);
        set(s => ({ clients: s.clients.filter(c => c.id !== id) }));
      },

      addProject: async (project) => {
        const id = genId();
        const newProject = { ...project, id };
        if (MOCK) { set(s => ({ projects: [...s.projects, newProject] })); return; }
        await api('POST', '/api/projects', newProject);
        set(s => ({ projects: [...s.projects, newProject] }));
      },
      updateProject: async (id, project) => {
        if (MOCK) { set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...project } : p) })); return; }
        await api('PATCH', `/api/projects/${id}`, project);
        set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...project } : p) }));
      },
      deleteProject: async (id) => {
        if (MOCK) { set(s => ({ projects: s.projects.filter(p => p.id !== id) })); return; }
        await api('DELETE', `/api/projects/${id}`);
        set(s => ({ projects: s.projects.filter(p => p.id !== id) }));
      },

      addTask: async (task) => {
        const id = genId();
        const newTask = { ...task, id };
        if (MOCK) { set(s => ({ tasks: [...s.tasks, newTask] })); return; }
        await api('POST', '/api/tasks', newTask);
        set(s => ({ tasks: [...s.tasks, newTask] }));
      },
      updateTask: async (id, task) => {
        if (MOCK) { set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...task } : t) })); return; }
        await api('PATCH', `/api/tasks/${id}`, task);
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...task } : t) }));
      },
      deleteTask: async (id) => {
        if (MOCK) { set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })); return; }
        await api('DELETE', `/api/tasks/${id}`);
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
      },
      updateTaskStatus: async (taskId, newStatus) => {
        if (MOCK) { set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) })); return; }
        await api('PATCH', `/api/tasks/${taskId}`, { status: newStatus });
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) }));
      },

      addTransaction: async (tx) => {
        const id = genId();
        const newTx = { ...tx, id };
        if (MOCK) { set(s => ({ transactions: [...s.transactions, newTx] })); return; }
        await api('POST', '/api/transactions', newTx);
        set(s => ({ transactions: [...s.transactions, newTx] }));
      },
      updateTransaction: async (id, tx) => {
        if (MOCK) { set(s => ({ transactions: s.transactions.map(t => t.id === id ? { ...t, ...tx } : t) })); return; }
        await api('PATCH', `/api/transactions/${id}`, tx);
        set(s => ({ transactions: s.transactions.map(t => t.id === id ? { ...t, ...tx } : t) }));
      },
      deleteTransaction: async (id) => {
        if (MOCK) { set(s => ({ transactions: s.transactions.filter(t => t.id !== id) })); return; }
        await api('DELETE', `/api/transactions/${id}`);
        set(s => ({ transactions: s.transactions.filter(t => t.id !== id) }));
      },

      upsertBrandHub: async (hub) => {
        const id = hub.id ?? (hub.clientId ?? hub.projectId ?? crypto.randomUUID());
        const fullHub = { ...hub, id };
        if (MOCK) { set(s => ({ brandhubs: [...s.brandhubs.filter(b => b.id !== id), fullHub] })); return; }
        try {
          await api('PATCH', `/api/brandhubs/${id}`, fullHub);
        } catch {
          await api('POST', '/api/brandhubs', fullHub);
        }
        set(s => ({ brandhubs: [...s.brandhubs.filter(b => b.id !== id), fullHub] }));
      },
      updateBrandHub: async (id, hub) => {
        if (MOCK) { set(s => ({ brandhubs: s.brandhubs.map(b => b.id === id ? { ...b, ...hub } : b) })); return; }
        await api('PATCH', `/api/brandhubs/${id}`, hub);
        set(s => ({ brandhubs: s.brandhubs.map(b => b.id === id ? { ...b, ...hub } : b) }));
      },
      deleteBrandHub: async (id) => {
        if (MOCK) { set(s => ({ brandhubs: s.brandhubs.filter(b => b.id !== id) })); return; }
        await api('DELETE', `/api/brandhubs/${id}`);
        set(s => ({ brandhubs: s.brandhubs.filter(b => b.id !== id) }));
      },
    }),
    {
      name: 'nakaos-store',
      partialize: (state) => ({
        language: state.language,
        readNotificationIds: state.readNotificationIds,
      }),
    }
  )
);
