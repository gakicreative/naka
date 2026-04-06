import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Task, Client, Project, TeamUser } from '../../store';

interface CalendarViewPanelProps {
  tasks: Task[];
  clients: Client[];
  projects: Project[];
  teamUsers: TeamUser[];
  onTaskClick: (taskId: string) => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarViewPanel({ tasks, onTaskClick }: CalendarViewPanelProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const datedTasks = tasks.filter(t => t.dueDate);
  const undatedCount = tasks.length - datedTasks.length;

  const cells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: { date: Date; isCurrentMonth: boolean; tasks: Task[] }[] = [];

    // Prev month fill
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ date: new Date(year, month - 1, prevDays - i), isCurrentMonth: false, tasks: [] });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = date.toISOString().slice(0, 10);
      result.push({ date, isCurrentMonth: true, tasks: datedTasks.filter(t => t.dueDate?.startsWith(iso)) });
    }
    // Next month fill
    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      result.push({ date: new Date(year, month + 1, d), isCurrentMonth: false, tasks: [] });
    }
    return result;
  }, [currentMonth, datedTasks]);

  const monthLabel = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-3">
      {undatedCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2 text-xs text-yellow-400">
          {undatedCount} tarefa{undatedCount > 1 ? 's' : ''} sem data de vencimento — não exibida{undatedCount > 1 ? 's' : ''} no calendário
        </div>
      )}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-on-surface capitalize">{monthLabel}</span>
        <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-surface-container-high rounded-xl overflow-hidden">
        {WEEKDAYS.map(d => (
          <div key={d} className="bg-surface-container text-center py-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          const iso = cell.date.toISOString().slice(0, 10);
          const isToday = iso === today;
          const shown = cell.tasks.slice(0, 3);
          const overflow = cell.tasks.length - shown.length;
          return (
            <div
              key={i}
              className={cn(
                'bg-surface-container-low min-h-[80px] p-1.5 flex flex-col gap-0.5',
                !cell.isCurrentMonth && 'opacity-40'
              )}
            >
              <span className={cn(
                'text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full',
                isToday ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              )}>
                {cell.date.getDate()}
              </span>
              {shown.map(task => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task.id)}
                  className="text-left text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary truncate hover:bg-primary/25 transition-colors"
                >
                  {task.title}
                </button>
              ))}
              {overflow > 0 && (
                <span className="text-[10px] text-on-surface-variant px-1">+{overflow} mais</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
