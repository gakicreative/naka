import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface UserSession {
  role: 'admin' | 'socio' | 'seeder' | 'cliente';
  name: string;
  email?: string;
  activeClientId?: string;
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
  language: 'pt-BR' | 'en-US';
  setLanguage: (lang: 'pt-BR' | 'en-US') => void;

  // Labels
  addLabel: (label: Omit<TaskLabel, 'id'>) => void;
  updateLabel: (id: string, label: Partial<TaskLabel>) => void;
  deleteLabel: (id: string) => void;
  setLabels: (labels: TaskLabel[]) => void;

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
      session: null,
      language: 'pt-BR',
      setSession: (session) => set({ session }),
      setLanguage: (language) => set({ language }),

      addPin: async (pin) => {
        const id = genId();
        if (MOCK) { set(s => ({ pins: [...s.pins, { ...pin, id, createdAt: new Date().toISOString() }] })); return; }
        const docRef = doc(collection(db, 'pins'));
        await setDoc(docRef, { ...pin, id: docRef.id, createdAt: new Date().toISOString() });
      },
      updatePin: async (id, data) => {
        if (MOCK) { set(s => ({ pins: s.pins.map(p => p.id === id ? { ...p, ...data } : p) })); return; }
        await updateDoc(doc(db, 'pins', id), data);
      },
      deletePin: async (id) => {
        if (MOCK) { set(s => ({ pins: s.pins.filter(p => p.id !== id) })); return; }
        await deleteDoc(doc(db, 'pins', id));
      },

      readNotificationIds: [],
      markNotificationAsRead: async (id) => {
        if (MOCK) { set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })); return; }
        await updateDoc(doc(db, 'notifications', id), { read: true });
      },
      clearNotifications: async () => {
        if (MOCK) { set({ notifications: [] }); return; }
        const notifications = get().notifications;
        for (const n of notifications) {
          await deleteDoc(doc(db, 'notifications', n.id));
        }
      },
      setNotifications: (notifications) => set({ notifications }),

      addLabel: async (label) => {
        const id = genId();
        if (MOCK) { set(s => ({ labels: [...s.labels, { ...label, id }] })); return; }
        const docRef = doc(collection(db, 'labels'));
        await setDoc(docRef, { ...label, id: docRef.id });
      },
      updateLabel: async (id, label) => {
        if (MOCK) { set(s => ({ labels: s.labels.map(l => l.id === id ? { ...l, ...label } : l) })); return; }
        await updateDoc(doc(db, 'labels', id), label);
      },
      deleteLabel: async (id) => {
        if (MOCK) {
          set(s => ({
            labels: s.labels.filter(l => l.id !== id),
            tasks: s.tasks.map(t => t.tags?.includes(id) ? { ...t, tags: t.tags.filter(tag => tag !== id) } : t),
          }));
          return;
        }
        await deleteDoc(doc(db, 'labels', id));
        const tasks = get().tasks;
        await Promise.all(
          tasks
            .filter(t => t.tags?.includes(id))
            .map(t => updateDoc(doc(db, 'tasks', t.id), {
              tags: t.tags!.filter((tag) => tag !== id)
            }))
        );
      },
      setLabels: (labels) => set({ labels }),

      setPins: (pins) => set({ pins }),
      setClients: (clients) => set({ clients }),
      setProjects: (projects) => set({ projects }),
      setTasks: (tasks) => set({ tasks }),
      setTransactions: (transactions) => set({ transactions }),
      setBrandHubs: (brandhubs) => set({ brandhubs }),

      addClient: async (client) => {
        const id = genId();
        if (MOCK) { set(s => ({ clients: [...s.clients, { ...client, id }] })); return; }
        const docRef = doc(collection(db, 'clients'));
        await setDoc(docRef, { ...client, id: docRef.id });
      },
      updateClient: async (id, client) => {
        if (MOCK) { set(s => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...client } : c) })); return; }
        await updateDoc(doc(db, 'clients', id), client);
      },
      deleteClient: async (id) => {
        if (MOCK) { set(s => ({ clients: s.clients.filter(c => c.id !== id) })); return; }
        await deleteDoc(doc(db, 'clients', id));
      },

      addProject: async (project) => {
        const id = genId();
        if (MOCK) { set(s => ({ projects: [...s.projects, { ...project, id }] })); return; }
        const docRef = doc(collection(db, 'projects'));
        await setDoc(docRef, { ...project, id: docRef.id });
      },
      updateProject: async (id, project) => {
        if (MOCK) { set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...project } : p) })); return; }
        await updateDoc(doc(db, 'projects', id), project);
      },
      deleteProject: async (id) => {
        if (MOCK) { set(s => ({ projects: s.projects.filter(p => p.id !== id) })); return; }
        await deleteDoc(doc(db, 'projects', id));
      },

      addTask: async (task) => {
        const id = genId();
        if (MOCK) { set(s => ({ tasks: [...s.tasks, { ...task, id }] })); return; }
        const docRef = doc(collection(db, 'tasks'));
        await setDoc(docRef, { ...task, id: docRef.id });
      },
      updateTask: async (id, task) => {
        if (MOCK) { set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...task } : t) })); return; }
        await updateDoc(doc(db, 'tasks', id), task);
      },
      deleteTask: async (id) => {
        if (MOCK) { set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })); return; }
        await deleteDoc(doc(db, 'tasks', id));
      },
      updateTaskStatus: async (taskId, newStatus) => {
        if (MOCK) { set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) })); return; }
        await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      },

      addTransaction: async (tx) => {
        const id = genId();
        if (MOCK) { set(s => ({ transactions: [...s.transactions, { ...tx, id }] })); return; }
        const docRef = doc(collection(db, 'transactions'));
        await setDoc(docRef, { ...tx, id: docRef.id });
      },
      updateTransaction: async (id, tx) => {
        if (MOCK) { set(s => ({ transactions: s.transactions.map(t => t.id === id ? { ...t, ...tx } : t) })); return; }
        await updateDoc(doc(db, 'transactions', id), tx);
      },
      deleteTransaction: async (id) => {
        if (MOCK) { set(s => ({ transactions: s.transactions.filter(t => t.id !== id) })); return; }
        await deleteDoc(doc(db, 'transactions', id));
      },

      upsertBrandHub: async (hub) => {
        const id = hub.id ?? (hub.clientId ?? hub.projectId ?? crypto.randomUUID());
        if (MOCK) { set(s => ({ brandhubs: [...s.brandhubs.filter(b => b.id !== id), { ...hub, id }] })); return; }
        const docRef = doc(db, 'brandhubs', id);
        await setDoc(docRef, { ...hub, id }, { merge: true });
      },
      updateBrandHub: async (id, hub) => {
        if (MOCK) { set(s => ({ brandhubs: s.brandhubs.map(b => b.id === id ? { ...b, ...hub } : b) })); return; }
        await updateDoc(doc(db, 'brandhubs', id), hub);
      },
      deleteBrandHub: async (id) => {
        if (MOCK) { set(s => ({ brandhubs: s.brandhubs.filter(b => b.id !== id) })); return; }
        await deleteDoc(doc(db, 'brandhubs', id));
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
