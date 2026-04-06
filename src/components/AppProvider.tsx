import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from '../store';
import {
  MOCK_SESSION, MOCK_CLIENTS, MOCK_PROJECTS, MOCK_TASKS,
  MOCK_LABELS, MOCK_TRANSACTIONS, MOCK_NOTIFICATIONS, MOCK_BRANDHUBS,
  MOCK_TEAM_USERS, MOCK_FEEDBACKS,
} from '../lib/mockData';

const MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

const USER_NAME_KEY = 'nakaos-user-name';

interface AppContextType {
  userName: string;
  userInitial: string;
  setUserName: (name: string) => void;
  isAuthReady: boolean;
}

const AppContext = createContext<AppContextType>({
  userName: 'Gaki Creative',
  userInitial: 'G',
  setUserName: () => {},
  isAuthReady: false,
});

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const setClients = useStore((s) => s.setClients);
  const setProjects = useStore((s) => s.setProjects);
  const setTasks = useStore((s) => s.setTasks);
  const setTransactions = useStore((s) => s.setTransactions);
  const setBrandHubs = useStore((s) => s.setBrandHubs);
  const setPins = useStore((s) => s.setPins);
  const setLabels = useStore((s) => s.setLabels);
  const setNotifications = useStore((s) => s.setNotifications);
  const setFeedbacks = useStore((s) => s.setFeedbacks);
  const setTeamUsers = useStore((s) => s.setTeamUsers);
  const setSession = useStore((s) => s.setSession);

  const [isAuthReady, setIsAuthReady] = useState(false);

  const [userName, setUserNameState] = useState<string>(
    () => localStorage.getItem(USER_NAME_KEY) || 'Gaki Creative'
  );

  const setUserName = (name: string) => {
    const trimmed = name.trim() || 'Gaki Creative';
    localStorage.setItem(USER_NAME_KEY, trimmed);
    setUserNameState(trimmed);
  };

  // Mock mode: bypass API entirely
  useEffect(() => {
    if (!MOCK) return;
    setSession(MOCK_SESSION);
    setClients(MOCK_CLIENTS);
    setProjects(MOCK_PROJECTS);
    setTasks(MOCK_TASKS);
    setTransactions(MOCK_TRANSACTIONS);
    setLabels(MOCK_LABELS);
    setNotifications(MOCK_NOTIFICATIONS);
    setBrandHubs(MOCK_BRANDHUBS);
    setPins([]);
    setFeedbacks(MOCK_FEEDBACKS);
    setTeamUsers(MOCK_TEAM_USERS);
    setUserName(MOCK_SESSION.name);
    setIsAuthReady(true);
  }, []);

  // API mode: check JWT session + fetch all data
  useEffect(() => {
    if (MOCK) return;

    async function init() {
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!meRes.ok) {
          setSession(null);
          setIsAuthReady(true);
          return;
        }
        const me = await meRes.json();
        const u = me.user ?? me;
        setSession({
          role: u.role,
          name: u.name,
          email: u.email,
          activeClientId: u.activeClientId,
          orgId: u.orgId,
          taskView: u.taskView ?? null,
          orgLogoUrl: u.orgLogoUrl ?? null,
          orgName: u.orgName ?? '',
        });
        setUserName(u.name);

        const isAdmin = u.role === 'admin';

        const [
          clients, projects, tasks, transactions,
          brandhubs, pins, labels, notifications, feedbacks,
          teamUsersRes,
        ] = await Promise.all([
          fetch('/api/clients',       { credentials: 'include' }).then(r => r.json()),
          fetch('/api/projects',      { credentials: 'include' }).then(r => r.json()),
          fetch('/api/tasks',         { credentials: 'include' }).then(r => r.json()),
          fetch('/api/transactions',  { credentials: 'include' }).then(r => r.json()),
          fetch('/api/brandhubs',     { credentials: 'include' }).then(r => r.json()),
          fetch('/api/pins',          { credentials: 'include' }).then(r => r.json()),
          fetch('/api/labels',        { credentials: 'include' }).then(r => r.json()),
          fetch('/api/notifications', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/feedbacks',     { credentials: 'include' }).then(r => r.json()),
          isAdmin ? fetch('/api/team', { credentials: 'include' }).then(r => r.json()) : Promise.resolve([]),
        ]);

        setClients(Array.isArray(clients) ? clients : []);
        setProjects(Array.isArray(projects) ? projects : []);
        setTasks(Array.isArray(tasks) ? tasks : []);
        setTransactions(Array.isArray(transactions) ? transactions : []);
        setBrandHubs(Array.isArray(brandhubs) ? brandhubs : []);
        setPins(Array.isArray(pins) ? pins : []);
        setLabels(Array.isArray(labels) ? labels : []);
        setNotifications(Array.isArray(notifications) ? notifications : []);
        setFeedbacks(Array.isArray(feedbacks) ? feedbacks : []);
        setTeamUsers(Array.isArray(teamUsersRes) ? teamUsersRes : []);
      } catch (err) {
        console.error('Init error:', err);
        setSession(null);
      } finally {
        setIsAuthReady(true);
      }
    }

    init();
  }, []);

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <AppContext.Provider value={{ userName, userInitial, setUserName, isAuthReady }}>
      {children}
    </AppContext.Provider>
  );
}
