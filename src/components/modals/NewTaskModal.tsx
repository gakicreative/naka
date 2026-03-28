import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store';
import { toast } from 'sonner';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  projectId?: string;
}

export function NewTaskModal({ isOpen, onClose, clientId, projectId }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Média');
  const [selectedClientId, setSelectedClientId] = useState(clientId || '');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');

  const clients = useStore((s) => s.clients);
  const projects = useStore((s) => s.projects);
  const addTask = useStore((s) => s.addTask);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('O título da tarefa é obrigatório');
      return;
    }

    try {
      const newTask = {
        title,
        description,
        status: 'todo' as const,
        priority,
        clientId: selectedClientId,
        projectId: selectedProjectId,
        createdAt: new Date().toISOString(),
        assignees: [],
        labels: [],
        comments: [],
        attachments: [],
      };

      await addTask(newTask);
      toast.success('Tarefa criada com sucesso!');
      onClose();
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <h2 className="text-xl font-headline font-semibold text-on-surface">Nova Tarefa</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
              placeholder="Ex: Criar post para Instagram"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface min-h-[100px]"
              placeholder="Detalhes da tarefa..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Cliente</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
              >
                <option value="">Selecione um cliente</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Projeto</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
              >
                <option value="">Selecione um projeto</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
