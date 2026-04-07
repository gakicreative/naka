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
import { BrandHub } from './pages/BrandHub';
import { BrandHubDetail } from './pages/BrandHubDetail';
import { ClientDetail } from './pages/ClientDetail';
import { ProjectDetail } from './pages/ProjectDetail';
import { Finances } from './pages/Finances';
import { Team } from './pages/Team';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ClientPortal } from './pages/portal/ClientPortal';
import { AppProvider } from './components/AppProvider';
import { AnimationProvider } from './contexts/AnimationContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AnimationProvider>
    <AppProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
          <Route path="/app" element={
            <RoleGuard allow={['admin', 'socio', 'seeder']} redirectTo="/login">
              <Layout />
            </RoleGuard>
          }>
            <Route index element={<Dashboard />} />

            {/* Admin + Seeder + Socio */}
            <Route
              path="clients"
              element={
                <RoleGuard allow={['admin', 'socio', 'lider', 'seeder']}>
                  <Clients />
                </RoleGuard>
              }
            />
            <Route
              path="clients/:clientId"
              element={
                <RoleGuard allow={['admin', 'socio', 'lider', 'seeder']}>
                  <ClientDetail />
                </RoleGuard>
              }
            />
            <Route
              path="clients/:clientId/tasks"
              element={
                <RoleGuard allow={['admin', 'socio', 'lider', 'seeder']}>
                  <KanbanBoard />
                </RoleGuard>
              }
            />

            {/* All authenticated users */}
            <Route path="tasks" element={<Tasks />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="projects/:projectId/tasks" element={<KanbanBoard />} />
            <Route path="brand-hub" element={<BrandHub />} />
            <Route path="brand-hub/:hubId" element={<BrandHubDetail />} />
            <Route
              path="finances"
              element={
                <RoleGuard allow={['admin']}>
                  <Finances />
                </RoleGuard>
              }
            />
            <Route
              path="team"
              element={
                <RoleGuard allow={['admin']}>
                  <Team />
                </RoleGuard>
              }
            />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
    </AnimationProvider>
  );
}
