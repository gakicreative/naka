import React from 'react';
import { LayoutGrid, List, Calendar, GanttChart, Columns2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TaskViewType } from '../../store';

interface TaskViewSelectorProps {
  activeView: TaskViewType;
  onChange: (view: TaskViewType) => void;
}

const VIEWS: { id: TaskViewType; label: string; Icon: React.ElementType }[] = [
  { id: 'kanban',         label: 'Kanban',    Icon: LayoutGrid },
  { id: 'list',           label: 'Lista',     Icon: List },
  { id: 'calendar',       label: 'Calendário',Icon: Calendar },
  { id: 'timeline',       label: 'Timeline',  Icon: GanttChart },
  { id: 'board-by-client',label: 'Clientes',  Icon: Columns2 },
];

export function TaskViewSelector({ activeView, onChange }: TaskViewSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1">
      {VIEWS.map(({ id, label, Icon }) => (
        <button
          key={id}
          aria-pressed={activeView === id}
          onClick={() => onChange(id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            activeView === id
              ? 'bg-primary/10 text-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
