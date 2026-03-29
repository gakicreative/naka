import React, { useState } from 'react';
import { Plus, Palette } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { BrandCard } from '../components/brandhub/BrandCard';
import { NewBrandHubModal } from '../components/modals/NewBrandHubModal';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function BrandHub() {
  const { t } = useTranslation();
  const brandhubs = useStore((s) => s.brandhubs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show client-level hubs in the main listing
  const clientHubs = brandhubs.filter((h) => h.scope === 'client');

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">
            {t('brandhub.title')}
          </h1>
          <p className="text-on-surface-variant mt-1">
            {clientHubs.length} {clientHubs.length === 1 ? 'marca' : 'marcas'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          {t('brandhub.newHub')}
        </button>
      </div>

      {clientHubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant gap-4">
          <Palette className="w-14 h-14 opacity-25" />
          <p className="text-sm">{t('brandhub.noHubs')}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-5 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            {t('brandhub.newHub')}
          </button>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {clientHubs.map((hub) => (
            <motion.div key={hub.id} variants={item}>
              <BrandCard hub={hub} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <NewBrandHubModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
