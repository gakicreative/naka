import React, { createContext, useContext, useEffect, useState } from 'react';

interface AnimationContextType {
  enabled: boolean;
  ready: boolean;
}

const AnimationContext = createContext<AnimationContextType>({ enabled: false, ready: false });

export const useAnimation = () => useContext(AnimationContext);

const TIMEOUT_MS = 3000;

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) setEnabled(false);
    }, TIMEOUT_MS);

    import('@lottiefiles/react-lottie-player')
      .then(() => {
        setReady(true);
        clearTimeout(timer);
      })
      .catch(() => {
        setEnabled(false);
        clearTimeout(timer);
      });

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimationContext.Provider value={{ enabled, ready }}>
      {children}
    </AnimationContext.Provider>
  );
}
