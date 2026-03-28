import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore, type UserSession } from '../store';
import { useApp } from './AppProvider';

interface Props {
  allow: UserSession['role'][];
  children: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ allow, children, redirectTo = '/' }: Props) {
  const session = useStore((s) => s.session);
  const { isAuthReady } = useApp();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session || !allow.includes(session.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
