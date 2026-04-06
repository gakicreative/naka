import React from 'react';
import { cn } from '../../lib/utils';
import type { Task, Client, Project, TeamUser } from '../../store';

interface BoardByClientViewPanelProps {
  tasks: Task[];
  clients: Client[];
  projects: Project[];
  teamUsers: TeamUser[];
  onTaskClick: (taskId: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  Urgente: 'text-error',
  Alta:    'text-orange-400',
  Média:   'text-primary',
  Baixa:   'text-green-400',
};

export function BoardByClientViewPanel({ tasks, clients, onTaskClick }: BoardByClientViewPanelProps) {
  const clientIds = [...new Set(tasks.filter(t => t.clientId).map(t => t.clientId!))] ;
  const unassigned = tasks.filter(t => !t.clientId);

  const columns = [
    ...clientIds.map(id => ({ clientId: id, client: clients.find(c => c.id === id) ?? null, tasks: tasks.filter(t => t.clientId === id) })),
    ...(unassigned.length > 0 ? [{ clientId: null, client: null, tasks: unassigned }] : []),
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(col => (
        <div key={col.clientId ?? '__unassigned'} className="flex-shrink-0 w-72 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 mb-1">
            {col.client ? (
              <>
                <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center text-sm font-bold text-on-primary">
                  {col.client.logo}
                </div>
                <span className="text-sm font-semibold text-on-surface truncate">{col.client.name}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-on-surface-variant">Sem Cliente</span>
            )}
            <span className="ml-auto text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
              {col.tasks.length}
            </span>
          </div>

          {col.tasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task.id)}
              className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 cursor-pointer hover:border-primary/30 transition-colors space-y-1.5"
            >
              <p className="text-sm font-medium text-on-surface leading-snug">{task.title}</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className={cn('font-medium', PRIORITY_COLORS[task.priority] ?? 'text-on-surface-variant')}>
                  {task.priority}
                </span>
                {task.dueDate && <span className="text-on-surface-variant">{task.dueDate}</span>}
              </div>
              {task.assignees?.length > 0 && (
                <p className="text-[10px] text-on-surface-variant truncate">{task.assignees.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      ))}

      {columns.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-16 text-sm text-on-surface-variant">
          Nenhuma tarefa encontrada
        </div>
      )}
    </div>
  );
}
