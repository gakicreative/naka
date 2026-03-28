import React, { useState } from 'react';
import { Search, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Tasks() {
  const { t } = useTranslation();
  const tasks = useStore((state) => state.tasks);
  const clients = useStore((state) => state.clients);
  const session = useStore((state) => state.session);
  const [search, setSearch] = useState('');

  const isAdminOrSocio = session?.role === 'admin' || session?.role === 'socio';
  const today = new Date().toISOString().slice(0, 10);

  const todayTasks = tasks.filter(t =>
    t.dueDate?.startsWith(today) &&
    t.status !== 'done' &&
    t.status !== 'archived' &&
    (isAdminOrSocio || t.assignees?.includes(session?.name ?? ''))
  );

  const urgentCount = todayTasks.filter(t => t.priority === 'Urgente').length;

  // Group tasks by clientId
  const clientIdsWithTasks = [...new Set(todayTasks.map(t => t.clientId).filter(Boolean))];

  const clientsWithTasks = clients
    .filter(c => clientIdsWithTasks.includes(c.id))
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const getClientTaskCount = (clientId: string) =>
    todayTasks.filter(t => t.clientId === clientId).length;

  const hasUrgent = (clientId: string) =>
    todayTasks.some(t => t.clientId === clientId && t.priority === 'Urgente');

  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  }).format(new Date());

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">{t('tasks.title')}</h1>
          <p className="text-on-surface-variant mt-1 capitalize">{dateLabel}</p>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container-high">
          <h3 className="text-[10px] font-medium text-primary uppercase tracking-wider mb-1">{t('tasks.todayCount').toUpperCase()}</h3>
          <div className="text-2xl font-headline font-bold text-on-surface">{todayTasks.length}</div>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container-high">
          <h3 className={cn(
            "text-[10px] font-medium uppercase tracking-wider mb-1",
            urgentCount > 0 ? "text-error" : "text-on-surface-variant"
          )}>{t('tasks.urgentCount').toUpperCase()}</h3>
          <div className="text-2xl font-headline font-bold text-on-surface">{urgentCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('tasks.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Client Cards Grid */}
      {clientsWithTasks.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {clientsWithTasks.map((client) => {
            const taskCount = getClientTaskCount(client.id);
            const urgent = hasUrgent(client.id);
            return (
              <motion.div
                variants={item}
                key={client.id}
                className="bg-surface-container-low rounded-2xl border border-surface-container-high p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-2xl font-headline font-bold text-on-primary shadow-sm shadow-primary/20">
                      {client.logo}
                    </div>
                    <div>
                      <h3 className="font-headline font-semibold text-on-surface leading-tight">{client.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">{client.industry}</p>
                    </div>
                  </div>
                  {urgent && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium border shrink-0 bg-error/10 text-error border-error/20">
                      {t('tasks.urgentCount')}
                    </span>
                  )}
                </div>

                <div className="px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">{t('tasks.todayCount')}</span>
                  <p className="text-sm font-headline font-semibold text-on-surface mt-0.5">
                    {taskCount} {t('tasks.tasksLabel')}
                  </p>
                </div>

                <Link
                  to={`/clients/${client.id}/tasks`}
                  className="w-full text-center py-2 rounded-xl border border-surface-container-high text-sm font-medium text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors"
                >
                  {t('tasks.viewKanban')}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low rounded-2xl border border-surface-container-high p-12 flex flex-col items-center gap-3"
        >
          <CheckSquare className="w-12 h-12 text-on-surface-variant opacity-30" />
          <p className="text-sm text-on-surface-variant">{t('tasks.noTasksToday')}</p>
        </motion.div>
      )}
    </div>
  );
}
