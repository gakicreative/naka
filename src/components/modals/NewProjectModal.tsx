import React, { useState } from 'react';
import { Modal } from '../Modal';
import { useStore } from '../../store';
import { toast } from 'sonner';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const addProject = useStore((state) => state.addProject);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    status: 'Ativo' as const,
    stage: 'Planejamento' as const,
    dueDate: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addProject({
        ...formData,
        progress: 0,
        team: 1,
        createdAt: new Date().toISOString(),
      });
      toast.success('Projeto criado com sucesso!');
      onClose();
      setFormData({
        name: '',
        status: 'Ativo',
        stage: 'Planejamento',
        dueDate: '',
        description: '',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Projeto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Nome do Projeto
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
              placeholder="Ex: Redesign do Site"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface resize-none h-24"
              placeholder="Descreva o objetivo do projeto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Fase Inicial
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
              >
                <option value="Planejamento">Planejamento</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Revisão">Revisão</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Prazo Estimado
              </label>
              <input
                required
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : 'Criar Projeto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
