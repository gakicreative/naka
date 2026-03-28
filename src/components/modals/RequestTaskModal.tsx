import React, { useState } from 'react';
import { Modal } from '../Modal';
import { useStore } from '../../store';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface RequestTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export function RequestTaskModal({ isOpen, onClose, clientId }: RequestTaskModalProps) {
  const { t } = useTranslation();
  const addTask = useStore((state) => state.addTask);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      addTask({
        title: formData.title,
        description: formData.description,
        clientId,
        status: 'todo',
        priority: 'Média',
        dueDate: '',
        assignees: [],
        createdAt: new Date().toISOString(),
      });
      onClose();
      setFormData({ title: '', description: '' });
      toast.success(t('requestTask.success'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('requestTask.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-on-surface-variant">{t('requestTask.whatLabel')}</label>
          <input
            required
            type="text"
            className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
            placeholder={t('requestTask.whatPlaceholder')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-on-surface-variant">{t('requestTask.detailsLabel')}</label>
          <textarea
            className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface resize-none h-24"
            placeholder={t('requestTask.detailsPlaceholder')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl text-sm font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            {t('requestTask.submit')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
