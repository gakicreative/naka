import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const clients = useStore((state) => state.clients);
  const [isClientModalOpen, setClientModalOpen] = useState(false);

  const activeClientsCount = clients.filter(c => c.status === 'Ativo').length;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">{t('clients.title')}</h1>
          <p className="text-on-surface-variant mt-1">{t('clients.subtitle')}</p>
        </div>
        <button
          onClick={() => setClientModalOpen(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('clients.new')}
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container-high">
          <h3 className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider mb-1">ATIVOS</h3>
          <div className="text-2xl font-headline font-bold text-on-surface">{activeClientsCount}</div>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container-high">
          <h3 className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">TOTAL</h3>
          <div className="text-2xl font-headline font-bold text-on-surface">{clients.length}</div>
        </div>
      </div>

      {/* Client Cards Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {clients.map((client) => (
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
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium border shrink-0",
                client.status === 'Ativo'
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-surface-variant/10 text-on-surface-variant border-surface-container-highest"
              )}>
                {client.status}
              </span>
            </div>

            {client.retainer?.value ? (
              <div className="px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">{t('clients.monthlyRetainer')}</span>
                <p className="text-sm font-headline font-semibold text-on-surface mt-0.5">
                  {formatCurrency(client.retainer.value)}
                </p>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">{t('clients.monthlyRetainer')}</span>
                <p className="text-sm text-on-surface-variant mt-0.5">—</p>
              </div>
            )}

            <Link
              to={`/clients/${client.id}/tasks`}
              className="w-full text-center py-2 rounded-xl border border-surface-container-high text-sm font-medium text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors"
            >
              {t('clients.openKanban')}
            </Link>
          </motion.div>
        ))}

        {clients.length === 0 && (
          <motion.div variants={item} className="col-span-full bg-surface-container-low rounded-2xl border border-surface-container-high p-12 flex flex-col items-center gap-3">
            <Users className="w-12 h-12 text-on-surface-variant opacity-30" />
            <p className="text-sm text-on-surface-variant">{t('clients.noClients')}</p>
            <button
              onClick={() => setClientModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t('clients.addFirst')}
            </button>
          </motion.div>
        )}
      </motion.div>

      <NewClientModal isOpen={isClientModalOpen} onClose={() => setClientModalOpen(false)} />
    </div>
  );
}
