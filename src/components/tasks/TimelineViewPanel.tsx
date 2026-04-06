import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Task, Client, Project, TeamUser } from '../../store';

interface TimelineViewPanelProps {
  tasks: Task[];
  clients: Client[];
  projects: Project[];
  teamUsers: TeamUser[];
  onTaskClick: (taskId: string) => void;
}

const PRIORITY_BAR: Record<Task['priority'], string> = {
  Urgente: 'bg-[#ffb4ab]',
  Alta:    'bg-[#ffb4ab]',
  Média:   'bg-[#6cd3fc]',
  Baixa:   'bg-[#81c784]',
};

const TOTAL_DAYS = 30;

function calcBar(task: Task, viewStart: Date) {
  const end = task.dueDate ? new Date(task.dueDate) : null;
  if (!end) return null;
  const start = task.startDate ? new Date(task.startDate) : end;
  const viewEnd = new Date(viewStart);
  viewEnd.setDate(viewEnd.getDate() + TOTAL_DAYS);
  if (end < viewStart || start > viewEnd) return null;

  const left = Math.max(0, (start.getTime() - viewStart.getTime()) / 86400000);
  const rawWidth = Math.max(1, (end.getTime() - start.getTime()) / 86400000 + 1);
  const width = Math.min(rawWidth, TOTAL_DAYS - left);

  return {
    leftPercent: (left / TOTAL_DAYS) * 100,
    widthPercent: (width / TOTAL_DAYS) * 100,
  };
}

export function TimelineViewPanel({ tasks, onTaskClick }: TimelineViewPanelProps) {
  const [viewStart, setViewStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [tooltip, setTooltip] = useState<{ task: Task; x: number; y: number } | null>(null);

  const undatedCount = tasks.filter(t => !t.dueDate && !t.startDate).length;

  const visibleTasks = useMemo(
    () => tasks.filter(t => t.dueDate || t.startDate),
    [tasks]
  );

  const dayLabels = useMemo(() => {
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(viewStart);
      d.setDate(d.getDate() + i);
      return d.getDate();
    });
  }, [viewStart]);

  const nav = (delta: number) => {
    setViewStart(s => { const d = new Date(s); d.setDate(d.getDate() + delta * TOTAL_DAYS); return d; });
  };

  const monthLabel = viewStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-3">
      {undatedCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2 text-xs text-yellow-400">
          {undatedCount} tarefa{undatedCount > 1 ? 's' : ''} sem datas — não exibida{undatedCount > 1 ? 's' : ''} na timeline
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-on-surface capitalize">{monthLabel}</span>
        <button onClick={() => nav(1)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-container-high">
        {/* Day header */}
        <div className="flex border-b border-surface-container-high bg-surface-container">
          <div className="w-40 flex-shrink-0 px-3 py-1.5 text-[10px] text-on-surface-variant font-medium">Tarefa</div>
          <div className="flex-1 flex">
            {dayLabels.map((d, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-on-surface-variant py-1.5 border-l border-surface-container-high/50">
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {visibleTasks.map(task => {
          const bar = calcBar(task, viewStart);
          return (
            <div key={task.id} className="flex border-b border-surface-container-high/40 hover:bg-surface-container/20">
              <div
                className="w-40 flex-shrink-0 px-3 py-2 text-xs text-on-surface truncate cursor-pointer"
                onClick={() => onTaskClick(task.id)}
              >
                {task.title}
              </div>
              <div className="flex-1 relative h-9">
                {bar && (
                  <div
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 h-5 rounded-full cursor-pointer opacity-90 hover:opacity-100 transition-opacity',
                      PRIORITY_BAR[task.priority]
                    )}
                    style={{ left: `${bar.leftPercent}%`, width: `${bar.widthPercent}%` }}
                    onClick={() => onTaskClick(task.id)}
                    onMouseEnter={e => setTooltip({ task, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )}
              </div>
            </div>
          );
        })}

        {visibleTasks.length === 0 && (
          <div className="py-12 text-center text-sm text-on-surface-variant">Nenhuma tarefa com datas neste período</div>
        )}
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-surface-container-low border border-surface-container-high rounded-xl shadow-lg p-3 text-xs space-y-1 pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-on-surface">{tooltip.task.title}</p>
          {tooltip.task.assignees?.length > 0 && <p className="text-on-surface-variant">{tooltip.task.assignees.join(', ')}</p>}
          {tooltip.task.startDate && <p className="text-on-surface-variant">Início: {tooltip.task.startDate}</p>}
          {tooltip.task.dueDate && <p className="text-on-surface-variant">Venc: {tooltip.task.dueDate}</p>}
          <p className="text-on-surface-variant capitalize">{tooltip.task.status}</p>
        </div>
      )}
    </div>
  );
}
