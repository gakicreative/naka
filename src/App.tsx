/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RoleGuard } from './components/RoleGuard';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Tasks } from './pages/Tasks';
import { KanbanBoard } from './pages/KanbanBoard';
import { Settings } from './pages/Settings';
import { Projects } from './pages/Projects';
import { Login } from './pages/Login';
import { ClientPortal } from './pages/portal/ClientPortal';
import { AppProvider } from './components/AppProvider';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Client Portal */}
          <Route
            path="/portal"
            element={
              <RoleGuard allow={['cliente']} redirectTo="/login">
                <ClientPortal />
              </RoleGuard>
            }
          />

          {/* App Shell */}
          <Route path="/" element={
            <RoleGuard allow={['admin', 'socio', 'seeder']} redirectTo="/login">
              <Layout />
            </RoleGuard>
          }>
            <Route index element={<Dashboard />} />

            {/* Admin + Seeder + Socio */}
            <Route
              path="clients"
              element={
                <RoleGuard allow={['admin', 'socio', 'seeder']}>
                  <Clients />
                </RoleGuard>
              }
            />
            <Route
              path="clients/:clientId/tasks"
              element={
                <RoleGuard allow={['admin', 'socio', 'seeder']}>
                  <KanbanBoard />
                </RoleGuard>
              }
            />

            {/* All authenticated users */}
            <Route path="tasks" element={<Tasks />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId/tasks" element={<KanbanBoard />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
