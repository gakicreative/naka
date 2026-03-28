import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowUpRight, Folder, CheckSquare, Users, Clock, AlertCircle, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import { NewClientModal } from '../components/modals/NewClientModal';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Dashboard() {
  const { t } = useTranslation();
  const projects = useStore((state) => state.projects);
  const tasks = useStore((state) => state.tasks);
  const clients = useStore((state) => state.clients);
  const transactions = useStore((state) => state.transactions);
  const session = useStore((s) => s.session);

  const [isClientModalOpen, setClientModalOpen] = useState(false);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const monthlyRevenue = transactions
    .filter((t) => t.type === 'in' && t.status === 'Concluído' && t.date >= startOfMonth && t.date <= endOfMonth)
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingInvoices = transactions
    .filter((t) => t.type === 'in' && t.status === 'Pendente')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const activeProjectsCount = projects.filter(p => p.status === 'Ativo').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;
  const activeClientsCount = clients.filter(c => c.status === 'Ativo').length;

  const urgentTasks = tasks.filter(t => (t.priority === 'Urgente' || t.priority === 'Alta') && t.status !== 'done').slice(0, 3);
  const featuredProjects = projects.filter(p => p.status === 'Ativo').slice(0, 2);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      <motion.header variants={item} className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-on-surface">
          {t('dashboard.greeting', { name: session.name })}
        </h1>
        <p className="text-on-surface-variant text-sm md:text-base">
          {t('dashboard.subtitle')}
        </p>
      </motion.header>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Folder className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{t('common.updated')}</span>
          </div>
          <div>
            <h3 className="text-3xl font-headline font-bold text-on-surface">{activeProjectsCount}</h3>
            <p className="text-sm text-on-surface-variant font-medium mt-1">{t('dashboard.activeProjects')}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">{t('common.active_badge')}</span>
          </div>
          <div>
            <h3 className="text-3xl font-headline font-bold text-on-surface">{pendingTasksCount}</h3>
            <p className="text-sm text-on-surface-variant font-medium mt-1">{t('dashboard.pendingTasks')}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{t('common.updated')}</span>
          </div>
          <div>
            <h3 className="text-3xl font-headline font-bold text-on-surface">{activeClientsCount}</h3>
            <p className="text-sm text-on-surface-variant font-medium mt-1">{t('dashboard.activeClients')}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{t('common.currentMonth')}</span>
          </div>
          <div>
            <h3 className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(monthlyRevenue)}</h3>
            <p className="text-sm text-on-surface-variant font-medium mt-1">{t('dashboard.monthlyRevenue')}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks & Projects */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Urgent Tasks */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-headline font-semibold text-on-surface flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-error" />
                {t('dashboard.priorityTasks')}
              </h2>
              <Link to="/tasks" className="text-sm text-primary hover:underline font-medium">{t('common.viewAll')}</Link>
            </div>
            <div className="space-y-3">
              {urgentTasks.length > 0 ? urgentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl glass-card cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-2 h-2 rounded-full", task.priority === 'Urgente' ? "bg-error" : "bg-primary")} />
                    <div>
                      <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{task.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{projects.find(p => p.id === task.projectId)?.name || t('dashboard.noProject')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {task.dueDate}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-on-surface-variant">{t('dashboard.noUrgentTasks')}</p>
              )}
            </div>
          </div>

          {/* Active Projects */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-headline font-semibold text-on-surface">{t('dashboard.featuredProjects')}</h2>
              <Link to="/projects" className="text-sm text-primary hover:underline font-medium">{t('common.viewAll')}</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProjects.map((project) => (
                <Link to={`/projects/${project.id}`} key={project.id} className="p-4 rounded-2xl border border-surface-container-high bg-surface-container-lowest hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-lg font-bold text-on-surface group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-headline font-semibold text-on-surface truncate">{project.name}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-on-surface-variant">{t('dashboard.progress')}</span>
                      <span className="text-xs font-bold text-primary">{project.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
              {featuredProjects.length === 0 && (
                <p className="text-sm text-on-surface-variant col-span-2">{t('dashboard.noFeaturedProjects')}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Quick Actions & Finances */}
        <motion.div variants={item} className="space-y-6">
          {/* Quick Actions */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-headline font-semibold text-on-surface mb-4">{t('dashboard.quickActions')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setClientModalOpen(true)} className="p-4 rounded-xl glass-card flex flex-col items-center justify-center gap-2 text-center group">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-on-surface">{t('dashboard.newClient')}</span>
              </button>
            </div>
          </div>

          {/* Pending Invoices Mini */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-headline font-semibold text-on-surface">{t('dashboard.receivables')}</h2>
              <Link to="/finances" className="text-sm text-primary hover:underline font-medium">{t('nav.finances')}</Link>
            </div>
            <div className="space-y-3">
              {pendingInvoices.slice(0, 4).map((invoice) => {
                const checkDate = (invoice as any).dueDate || invoice.date;
                const isLate = new Date(checkDate) < new Date() && new Date(checkDate).toDateString() !== new Date().toDateString();
                const d = new Date(invoice.date);
                const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
                const dateStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(adjustedDate);
                return (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl glass-card">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-on-surface truncate">{invoice.description}</p>
                    <p className={cn("text-xs font-medium mt-0.5", isLate ? "text-error" : "text-on-surface-variant")}>
                      {isLate ? t('common.status.late') : dateStr}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-on-surface whitespace-nowrap">{formatCurrency(invoice.amount)}</span>
                </div>
              )})}
              {pendingInvoices.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-4">{t('dashboard.noPendingInvoices')}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <NewClientModal isOpen={isClientModalOpen} onClose={() => setClientModalOpen(false)} />
    </motion.div>
  );
}
