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
  createdAt?: string;
  retainer?: {
    value: number;
    hours: number;
    loggedHours: number;
    renewalDate: string;
    healthScore: number;
    focus: string[];
  };
  contacts?: {
    name: string;
    role: string;
    email: string;
  }[];
  maxActiveTasks?: number;
}

export interface BrandHub {
  id: string;
  userId: string;
  projectId: string;
  colors: { name: string; hex: string }[];
  fonts: { name: string; url: string }[];
  logos: { name: string; url: string }[];
  identity: {
    nicho: string;
    publicoAlvo: string;
    tomDeVoz: string;
    slogan: string;
    concorrentes: string;
    restricoesVisuais: string;
  };
  figmaLink: string;
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
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  category: string;
  date: string;
  status: string;
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
        const docRef = doc(collection(db, 'pins'));
        await setDoc(docRef, { ...pin, id: docRef.id, createdAt: new Date().toISOString() });
      },
      updatePin: async (id, data) => {
        await updateDoc(doc(db, 'pins', id), data);
      },
      deletePin: async (id) => {
        await deleteDoc(doc(db, 'pins', id));
      },

      readNotificationIds: [],
      markNotificationAsRead: async (id) => {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      },
      clearNotifications: async () => {
        const notifications = get().notifications;
        for (const n of notifications) {
          await deleteDoc(doc(db, 'notifications', n.id));
        }
      },
      setNotifications: (notifications) => set({ notifications }),

      addLabel: async (label) => {
        const docRef = doc(collection(db, 'labels'));
        await setDoc(docRef, { ...label, id: docRef.id });
      },
      updateLabel: async (id, label) => {
        await updateDoc(doc(db, 'labels', id), label);
      },
      deleteLabel: async (id) => {
        await deleteDoc(doc(db, 'labels', id));
        // Also remove label from tasks locally for immediate UI update, 
        // though ideally a cloud function should handle this
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
        const docRef = doc(collection(db, 'clients'));
        await setDoc(docRef, { ...client, id: docRef.id });
      },
      updateClient: async (id, client) => {
        await updateDoc(doc(db, 'clients', id), client);
      },
      deleteClient: async (id) => {
        await deleteDoc(doc(db, 'clients', id));
      },

      addProject: async (project) => {
        const docRef = doc(collection(db, 'projects'));
        await setDoc(docRef, { ...project, id: docRef.id });
      },
      updateProject: async (id, project) => {
        await updateDoc(doc(db, 'projects', id), project);
      },
      deleteProject: async (id) => {
        await deleteDoc(doc(db, 'projects', id));
      },

      addTask: async (task) => {
        const docRef = doc(collection(db, 'tasks'));
        await setDoc(docRef, { ...task, id: docRef.id });
      },
      updateTask: async (id, task) => {
        await updateDoc(doc(db, 'tasks', id), task);
      },
      deleteTask: async (id) => {
        await deleteDoc(doc(db, 'tasks', id));
      },
      updateTaskStatus: async (taskId, newStatus) => {
        await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      },

      addTransaction: async (tx) => {
        const docRef = doc(collection(db, 'transactions'));
        await setDoc(docRef, { ...tx, id: docRef.id });
      },
      updateTransaction: async (id, tx) => {
        await updateDoc(doc(db, 'transactions', id), tx);
      },
      deleteTransaction: async (id) => {
        await deleteDoc(doc(db, 'transactions', id));
      },

      upsertBrandHub: async (hub) => {
        const id = hub.id ?? hub.projectId;
        const docRef = doc(db, 'brandhubs', id);
        await setDoc(docRef, { ...hub, id }, { merge: true });
      },
      updateBrandHub: async (id, hub) => {
        await updateDoc(doc(db, 'brandhubs', id), hub);
      },
      deleteBrandHub: async (id) => {
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
