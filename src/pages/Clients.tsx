import React, { useState } from 'react';
import { Search, Filter, Plus, ArrowUpRight, MoreVertical, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import { NewClientModal } from '../components/modals/NewClientModal';
import { EditClientModal } from '../components/modals/EditClientModal';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Client } from '../store';

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

export function Clients() {
  const { t } = useTranslation();
  const clients = useStore((state) => state.clients);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-on-surface">
            {t('clients.title')}
          </h1>
          <p className="text-on-surface-variant text-sm md:text-base">
            {t('clients.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors border border-surface-container-highest">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{t('clients.filter')}</span>
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary transition-colors font-medium shadow-sm shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">{t('clients.new')}</span>
          </button>
        </div>
      </header>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-surface-container-high pb-4">
        <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button className="text-primary font-medium border-b-2 border-primary pb-1 whitespace-nowrap">
            {t('clients.totalClients')} ({clients.length})
          </button>
          <button className="text-on-surface-variant hover:text-on-surface font-medium pb-1 whitespace-nowrap transition-colors">
            {t('clients.activeClients')} ({clients.filter(c => c.status === 'Ativo').length})
          </button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder={t('clients.search')} 
            className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant"
          />
        </div>
      </div>

      {/* Client Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {clients.map((client) => (
          <motion.div key={client.id} variants={item}>
            <Link 
              to={`/clients/${client.id}/tasks`}
              className="group block bg-surface-container-low rounded-3xl p-6 border border-surface-container-high hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
            >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingClient(client);
                }}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                title={t('clients.editTitle')}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <ArrowUpRight className="w-5 h-5 text-on-surface-variant" />
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-bold text-lg bg-primary/10 text-primary">
                {client.logo || client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-headline font-semibold text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                  {client.name}
                </h3>
                <p className="text-xs text-on-surface-variant">{client.industry}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">{t('clients.contactLabel')}</span>
                <span className="font-semibold text-on-surface text-sm truncate">{client.contact}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">{t('clients.statusLabel')}</span>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    client.status === 'Ativo' ? 'bg-emerald-500' : 'bg-surface-variant'
                  )}></div>
                  <span className="text-sm font-medium text-on-surface">{client.status}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-surface-container-high">
              <span className="text-xs text-on-surface-variant truncate">{client.email}</span>
              <span className="text-xs text-on-surface-variant">{client.phone}</span>
            </div>
          </Link>
          </motion.div>
        ))}

        {/* Add New Card */}
        <motion.button 
          variants={item}
          onClick={() => setModalOpen(true)}
          className="bg-surface-container-lowest rounded-3xl p-6 border border-dashed border-surface-container-high hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 min-h-[240px] group"
        >
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
            <Plus className="w-6 h-6 text-on-surface-variant group-hover:text-on-primary" />
          </div>
          <span className="font-medium text-on-surface-variant group-hover:text-primary transition-colors">{t('clients.addFirst')}</span>
        </motion.button>
      </motion.div>

      <NewClientModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      {editingClient && (
        <EditClientModal
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          client={editingClient}
        />
      )}
    </div>
  );
}
