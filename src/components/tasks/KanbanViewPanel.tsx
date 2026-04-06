import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import type { Task, Client, Project, TeamUser } from '../../store';

interface KanbanViewPanelProps {
  tasks: Task[];
  clients: Client[];
  projects: Project[];
  teamUsers: TeamUser[];
  onTaskClick: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

const COLUMNS: { status: Task['status']; label: string; color: string }[] = [
  { status: 'todo',        label: 'A Fazer',      color: 'text-on-surface-variant' },
  { status: 'in-progress', label: 'Em Progresso', color: 'text-primary' },
  { status: 'review',      label: 'Revisão',      color: 'text-yellow-400' },
  { status: 'done',        label: 'Concluído',    color: 'text-green-400' },
];

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  Urgente: 'bg-error/15 text-error border-error/30',
  Alta:    'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Média:   'bg-primary/15 text-primary border-primary/30',
  Baixa:   'bg-green-500/15 text-green-400 border-green-500/30',
};

export function KanbanViewPanel({ tasks, clients, projects, onTaskClick, onStatusChange }: KanbanViewPanelProps) {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  const getClient = (id?: string) => clients.find(c => c.id === id);
  const getProject = (id?: string) => projects.find(p => p.id === id);

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (dragTaskId) onStatusChange(dragTaskId, status);
    setDragTaskId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-0">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-72 flex flex-col gap-2"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col.status)}
          >
            <div className="flex items-center justify-between px-1 mb-1">
              <span className={cn('text-xs font-semibold uppercase tracking-wider', col.color)}>{col.label}</span>
              <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{colTasks.length}</span>
            </div>
            {colTasks.map(task => {
              const client = getClient(task.clientId);
              const project = getProject(task.projectId);
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragTaskId(task.id)}
                  onClick={() => onTaskClick(task.id)}
                  className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 cursor-pointer hover:border-primary/30 transition-colors space-y-2"
                >
                  <p className="text-sm font-medium text-on-surface leading-snug">{task.title}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', PRIORITY_COLORS[task.priority])}>
                      {task.priority}
                    </span>
                    {client && (
                      <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                        {client.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                    <span>{project?.name ?? ''}</span>
                    {task.dueDate && <span>{task.dueDate}</span>}
                  </div>
                  {task.assignees?.length > 0 && (
                    <p className="text-[10px] text-on-surface-variant truncate">{task.assignees.join(', ')}</p>
                  )}
                </div>
              );
            })}
            {colTasks.length === 0 && (
              <div className="border-2 border-dashed border-surface-container-high rounded-xl h-24 flex items-center justify-center text-xs text-on-surface-variant/40">
                Solte aqui
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
