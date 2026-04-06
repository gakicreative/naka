import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../store';
import type { TaskViewType } from '../store';
import { useApp } from '../components/AppProvider';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { NewTaskModal } from '../components/modals/NewTaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { TaskViewSelector } from '../components/tasks/TaskViewSelector';
import { TaskFilters, type TaskFiltersState } from '../components/tasks/TaskFilters';
import { KanbanViewPanel } from '../components/tasks/KanbanViewPanel';
import { ListViewPanel, type GroupByOption } from '../components/tasks/ListViewPanel';
import { CalendarViewPanel } from '../components/tasks/CalendarViewPanel';
import { TimelineViewPanel } from '../components/tasks/TimelineViewPanel';
import { BoardByClientViewPanel } from '../components/tasks/BoardByClientViewPanel';

const EMPTY_FILTERS: TaskFiltersState = { clientIds: [], projectIds: [], assigneeNames: [] };

export function Tasks() {
  const { t } = useTranslation();
  const { isAuthReady } = useApp();

  const session    = useStore(s => s.session);
  const tasks      = useStore(s => s.tasks);
  const clients    = useStore(s => s.clients);
  const projects   = useStore(s => s.projects);
  const teamUsers  = useStore(s => s.teamUsers);
  const updateTask = useStore(s => s.updateTask);
  const updateTaskView = useStore(s => s.updateTaskView);
  const updateTaskStatus = useStore(s => s.updateTaskStatus);

  const [activeView, setActiveView] = useState<TaskViewType>(session?.taskView ?? 'kanban');
  const [filters, setFilters] = useState<TaskFiltersState>(EMPTY_FILTERS);
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleViewChange = async (view: TaskViewType) => {
    setActiveView(view);
    updateTaskView(view);
    try {
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taskView: view }),
      });
    } catch {
      toast.error('Não foi possível salvar a preferência de visualização', { duration: 2000 });
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.clientIds.length > 0 && !filters.clientIds.includes(task.clientId ?? '')) return false;
      if (filters.projectIds.length > 0 && !filters.projectIds.includes(task.projectId ?? '')) return false;
      if (filters.assigneeNames.length > 0 && !task.assignees?.some(a => filters.assigneeNames.includes(a))) return false;
      return true;
    });
  }, [tasks, filters]);

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleStatusChange = async (taskId: string, newStatus: Parameters<typeof updateTaskStatus>[1]) => {
    const prev = tasks.find(t => t.id === taskId)?.status;
    updateTaskStatus(taskId, newStatus);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      if (prev) updateTask(taskId, { status: prev });
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  if (!isAuthReady) {
    return (
      <div className="space-y-4 max-w-full">
        <div className="h-10 bg-surface-container rounded-xl animate-pulse w-80" />
        <div className="h-64 bg-surface-container rounded-xl animate-pulse" />
      </div>
    );
  }

  const panelProps = { tasks: filteredTasks, clients, projects, teamUsers, onTaskClick: handleTaskClick };

  return (
    <div className="space-y-4 max-w-full h-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <h1 className="text-2xl font-headline font-bold text-on-surface">{t('tasks.title')}</h1>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('task.new')}
        </button>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
        <TaskViewSelector activeView={activeView} onChange={handleViewChange} />
        <TaskFilters
          filters={filters}
          clients={clients}
          projects={projects}
          teamUsers={teamUsers}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {activeView === 'kanban' && (
          <KanbanViewPanel {...panelProps} onStatusChange={handleStatusChange} />
        )}
        {activeView === 'list' && (
          <ListViewPanel {...panelProps} groupBy={groupBy} onGroupByChange={setGroupBy} />
        )}
        {activeView === 'calendar' && (
          <CalendarViewPanel {...panelProps} />
        )}
        {activeView === 'timeline' && (
          <TimelineViewPanel {...panelProps} />
        )}
        {activeView === 'board-by-client' && (
          <BoardByClientViewPanel {...panelProps} />
        )}
      </div>

      <NewTaskModal isOpen={showNewTask} onClose={() => setShowNewTask(false)} />

      {selectedTaskId && (() => {
        const task = tasks.find(t => t.id === selectedTaskId);
        return task ? (
          <TaskDetailModal task={task} onClose={() => setSelectedTaskId(null)} />
        ) : null;
      })()}
    </div>
  );
}
