import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStore, Client, Project, Task, Transaction, BrandHub, Pin, TaskLabel, Notification } from '../store';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection } from 'firebase/firestore';

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
  const language = useStore((s) => s.language);
  const clients = useStore((s) => s.clients);
  const setClients = useStore((s) => s.setClients);
  const setProjects = useStore((s) => s.setProjects);
  const setTasks = useStore((s) => s.setTasks);
  const setTransactions = useStore((s) => s.setTransactions);
  const setBrandHubs = useStore((s) => s.setBrandHubs);
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const setPins = useStore((s) => s.setPins);
  const pins = useStore((s) => s.pins);
  const labels = useStore((s) => s.labels);
  const setLabels = useStore((s) => s.setLabels);
  const setNotifications = useStore((s) => s.setNotifications);
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

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: 'admin' | 'socio' | 'seeder' | 'cliente' = 'cliente';
          let activeClientId: string | undefined = undefined;

          if (userDoc.exists()) {
            const data = userDoc.data();
            role = data.role;
            activeClientId = data.activeClientId;
          } else {
            // Create user if they don't exist
            // Default to admin if it's the specific email
            if (user.email === 'gakicreativegroup@gmail.com') {
              role = 'admin';
            } else {
              // Check for invite code in URL
              const urlParams = new URLSearchParams(window.location.search);
              const inviteCode = urlParams.get('invite');
              
              if (inviteCode) {
                try {
                  const inviteRef = doc(db, 'invitations', inviteCode);
                  const inviteSnap = await getDoc(inviteRef);
                  
                  if (inviteSnap.exists() && !inviteSnap.data().used) {
                    role = inviteSnap.data().role;
                    // Mark invite as used
                    await updateDoc(inviteRef, {
                      used: true,
                      usedBy: user.uid,
                      usedAt: new Date().toISOString()
                    });
                  }
                } catch (error) {
                  console.error("Error checking invitation:", error);
                }
              }
            }

            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              name: user.displayName || 'Usuário',
              role: role,
              createdAt: new Date().toISOString()
            });
          }

          setSession({
            role,
            name: user.displayName || 'Usuário',
            email: user.email || undefined,
            activeClientId
          });
          setUserName(user.displayName || 'Usuário');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setSession(null);
        setClients([]);
        setProjects([]);
        setTasks([]);
        setTransactions([]);
        setBrandHubs([]);
        setPins([]);
        setLabels([]);
        setNotifications([]);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (!isAuthReady || !auth.currentUser) return;

    const unsubscribes: (() => void)[] = [];

    // Listen to clients
    unsubscribes.push(
      onSnapshot(collection(db, 'clients'), (snapshot) => {
        setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
      }, (err) => console.error("Error fetching clients:", err))
    );

    // Listen to projects
    unsubscribes.push(
      onSnapshot(collection(db, 'projects'), (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      }, (err) => console.error("Error fetching projects:", err))
    );

    // Listen to tasks
    unsubscribes.push(
      onSnapshot(collection(db, 'tasks'), (snapshot) => {
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      }, (err) => console.error("Error fetching tasks:", err))
    );

    // Listen to transactions
    unsubscribes.push(
      onSnapshot(collection(db, 'transactions'), (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      }, (err) => console.error("Error fetching transactions:", err))
    );

    // Listen to brandhubs
    unsubscribes.push(
      onSnapshot(collection(db, 'brandhubs'), (snapshot) => {
        setBrandHubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BrandHub)));
      }, (err) => console.error("Error fetching brandhubs:", err))
    );

    // Listen to pins
    unsubscribes.push(
      onSnapshot(collection(db, 'pins'), (snapshot) => {
        setPins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pin)));
      }, (err) => console.error("Error fetching pins:", err))
    );

    // Listen to labels
    unsubscribes.push(
      onSnapshot(collection(db, 'labels'), (snapshot) => {
        setLabels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskLabel)));
      }, (err) => console.error("Error fetching labels:", err))
    );

    // Listen to notifications
    unsubscribes.push(
      onSnapshot(collection(db, 'notifications'), (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
      }, (err) => console.error("Error fetching notifications:", err))
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [isAuthReady, auth.currentUser?.uid]);

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <AppContext.Provider value={{ userName, userInitial, setUserName, isAuthReady }}>
      {children}
    </AppContext.Provider>
  );
}
