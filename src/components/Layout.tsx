import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Bell, Search, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from './AppProvider';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationPanel } from './NotificationPanel';
import { OrgLogo } from './OrgLogo';

type NavItem = {
  iconName: string;
  labelKey: string;
  path: string;
  roles: ('admin' | 'socio' | 'seeder' | 'cliente')[];
};

const navItems: NavItem[] = [
  { iconName: 'solar:home-2-linear',                 labelKey: 'nav.home',      path: '/',          roles: ['admin', 'socio', 'lider', 'seeder'] },
  { iconName: 'solar:users-group-rounded-linear',    labelKey: 'nav.clients',   path: '/clients',   roles: ['admin', 'socio', 'lider', 'seeder'] },
  { iconName: 'solar:checklist-minimalistic-linear', labelKey: 'nav.tasks',     path: '/tasks',     roles: ['admin', 'socio', 'lider', 'seeder'] },
  { iconName: 'solar:palette-linear',                labelKey: 'nav.brandHub',  path: '/brand-hub', roles: ['admin', 'socio', 'lider', 'seeder'] },
  { iconName: 'solar:wallet-linear',                 labelKey: 'nav.finances',  path: '/finances',  roles: ['admin'] },
  { iconName: 'solar:chart-linear',                  labelKey: 'nav.team',      path: '/team',      roles: ['admin'] },
  { iconName: 'solar:folder-linear',                 labelKey: 'nav.projects',  path: '/projects',  roles: ['admin', 'socio', 'lider', 'seeder'] },
  { iconName: 'solar:settings-linear',               labelKey: 'nav.settings',  path: '/settings',  roles: ['admin', 'socio', 'lider', 'seeder'] },
];


export function Layout() {
  const { t } = useTranslation();
  const { userName, userInitial, isAuthReady } = useApp();
  const notifications = useStore((s) => s.notifications) || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const session = useStore((s) => s.session);
  const setSession = useStore((s) => s.setSession);

  const visibleNav = navItems.filter((item) => item.roles.includes(session.role as never));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSession(null);
      navigate('/login');
    }
  };

  const displayName = session.role !== 'admin' ? session.name : userName;
  const displayInitial = displayName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'transparent' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-sidebar flex-shrink-0">
        <div className="p-6 flex items-center">
          <OrgLogo logoUrl={session?.orgLogoUrl} orgName={session?.orgName ?? 'Naka OS'} size="md" isLoading={!isAuthReady} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                  isActive ? "nav-active font-medium" : "nav-inactive"
                )
              }
            >
              <Icon icon={item.iconName} className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/4 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {displayInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-on-surface truncate">{displayName}</span>
              <span className="text-[11px] text-on-surface-variant/70">{t(`layout.roles.${session.role}`)}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm nav-inactive"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('layout.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Top App Bar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 glass-header">
          <div className="flex items-center gap-4 md:hidden">
            <OrgLogo logoUrl={session?.orgLogoUrl} orgName={session?.orgName ?? 'Naka OS'} size="sm" isLoading={!isAuthReady} />
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/4 border border-white/6 px-4 py-2 rounded-full w-80 focus-within:border-primary/30 transition-colors">
            <Search className="w-3.5 h-3.5 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder={t('layout.search')}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-on-surface-variant/40 text-on-surface"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Role badge */}
            <span className="hidden md:inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-on-surface-variant/70">
              {t(`layout.roles.${session.role}`)}
            </span>

            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setIsPanelOpen((v) => !v)}
                className={cn(
                  "p-2 rounded-full transition-colors relative",
                  isPanelOpen
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-white/6 text-on-surface-variant/70 hover:text-on-surface"
                )}
                aria-label="Notificações"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-error text-white text-[9px] font-bold rounded-full leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
              />
            </div>

            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm md:hidden">
              {displayInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-header border-t border-white/5 flex items-center justify-around p-3 pb-safe z-50">
        {visibleNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl min-w-[48px]",
                isActive ? "text-primary" : "text-on-surface-variant/50"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn("px-3 py-1 rounded-full transition-colors", isActive && "bg-primary/15")}>
                  <Icon icon={item.iconName} className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
                </div>
                <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
