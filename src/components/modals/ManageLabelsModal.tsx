import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ManageLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageLabelsModal({ isOpen, onClose }: ManageLabelsModalProps) {
  const { t } = useTranslation();
  const labels = useStore((s) => s.labels);
  const addLabel = useStore((s) => s.addLabel);
  const deleteLabel = useStore((s) => s.deleteLabel);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#b7c4ff');

  if (!isOpen) return null;

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    try {
      await addLabel({
        title: newLabelName,
        color: newLabelColor,
        iconName: 'solar:tag-linear'
      });
      setNewLabelName('');
      toast.success(t('labels.created'));
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error);
      toast.error(t('labels.errorCreate'));
    }
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      await deleteLabel(id);
      toast.success(t('labels.deleted'));
    } catch (error) {
      console.error('Erro ao excluir etiqueta:', error);
      toast.error(t('labels.errorDelete'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <h2 className="text-xl font-headline font-semibold text-on-surface">{t('labels.manageTitle')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleAddLabel} className="flex gap-3">
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
            />
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder={t('labels.newPlaceholder')}
              className="flex-1 px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            />
            <button
              type="submit"
              disabled={!newLabelName.trim()}
              className="p-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {labels.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm py-4">{t('labels.noLabels')}</p>
            ) : (
              labels.map((label) => (
                <div key={label.id} className="flex items-center justify-between p-3 bg-surface-variant rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }} />
                    <span className="text-sm font-medium text-on-surface">{label.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteLabel(label.id)}
                    className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
