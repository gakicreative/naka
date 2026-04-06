import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Task, Client, Project, TeamUser } from '../../store';

export type GroupByOption = 'none' | 'client' | 'project' | 'assignee' | 'priority' | 'status';

interface ListViewPanelProps {
  tasks: Task[];
  clients: Client[];
  projects: Project[];
  teamUsers: TeamUser[];
  onTaskClick: (taskId: string) => void;
  groupBy: GroupByOption;
  onGroupByChange: (g: GroupByOption) => void;
}

type SortCol = 'title' | 'status' | 'priority' | 'client' | 'project' | 'assignee' | 'startDate' | 'dueDate';

const PRIORITY_ORDER: Record<string, number> = { Urgente: 0, Alta: 1, Média: 2, Baixa: 3 };
const STATUS_ORDER: Record<string, number> = { todo: 0, 'in-progress': 1, review: 2, done: 3, archived: 4 };

const GROUP_OPTIONS: { id: GroupByOption; label: string }[] = [
  { id: 'none',     label: 'Sem Agrupamento' },
  { id: 'client',   label: 'Por Cliente' },
  { id: 'project',  label: 'Por Projeto' },
  { id: 'assignee', label: 'Por Responsável' },
  { id: 'priority', label: 'Por Prioridade' },
  { id: 'status',   label: 'Por Status' },
];

const STATUS_LABELS: Record<string, string> = {
  todo: 'A Fazer', 'in-progress': 'Em Progresso', review: 'Revisão', done: 'Concluído', archived: 'Arquivado',
};

export function ListViewPanel({ tasks, clients, projects, onTaskClick, groupBy, onGroupByChange }: ListViewPanelProps) {
  const [sort, setSort] = useState<{ col: SortCol; dir: 'asc' | 'desc' }>({ col: 'dueDate', dir: 'asc' });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name ?? '';
  const getProjectName = (id?: string) => projects.find(p => p.id === id)?.name ?? '';

  const sortTasks = (arr: Task[]) => [...arr].sort((a, b) => {
    let av = '', bv = '';
    switch (sort.col) {
      case 'title':     av = a.title;   bv = b.title; break;
      case 'status':    return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * (sort.dir === 'asc' ? 1 : -1);
      case 'priority':  return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * (sort.dir === 'asc' ? 1 : -1);
      case 'client':    av = getClientName(a.clientId);  bv = getClientName(b.clientId);  break;
      case 'project':   av = getProjectName(a.projectId); bv = getProjectName(b.projectId); break;
      case 'assignee':  av = a.assignees?.[0] ?? '';  bv = b.assignees?.[0] ?? '';  break;
      case 'startDate': av = a.startDate ?? ''; bv = b.startDate ?? ''; break;
      case 'dueDate':   av = a.dueDate ?? ''; bv = b.dueDate ?? ''; break;
    }
    return av.localeCompare(bv) * (sort.dir === 'asc' ? 1 : -1);
  });

  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: 'all', label: '', tasks: sortTasks(tasks) }];
    const map = new Map<string, Task[]>();
    tasks.forEach(t => {
      let key = '';
      if (groupBy === 'client')   key = getClientName(t.clientId) || 'Sem Cliente';
      if (groupBy === 'project')  key = getProjectName(t.projectId) || 'Sem Projeto';
      if (groupBy === 'assignee') key = t.assignees?.[0] ?? 'Sem Responsável';
      if (groupBy === 'priority') key = t.priority;
      if (groupBy === 'status')   key = STATUS_LABELS[t.status] ?? t.status;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return Array.from(map.entries()).map(([key, ts]) => ({ key, label: key, tasks: sortTasks(ts) }));
  }, [tasks, groupBy, sort]);

  const handleSort = (col: SortCol) => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));
  const SortIcon = ({ col }: { col: SortCol }) => sort.col !== col ? null : sort.dir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />;

  const COLS: { key: SortCol; label: string }[] = [
    { key: 'title', label: 'Título' }, { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Prioridade' }, { key: 'client', label: 'Cliente' },
    { key: 'project', label: 'Projeto' }, { key: 'assignee', label: 'Responsável' },
    { key: 'startDate', label: 'Início' }, { key: 'dueDate', label: 'Vencimento' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={groupBy}
          onChange={e => onGroupByChange(e.target.value as GroupByOption)}
          className="text-xs bg-surface-container border border-surface-container-high rounded-lg px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary/50"
        >
          {GROUP_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-container-high">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-surface-container-high bg-surface-container">
              {COLS.map(c => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  className="text-left px-3 py-2 text-on-surface-variant font-medium cursor-pointer hover:text-on-surface whitespace-nowrap select-none"
                >
                  {c.label} <SortIcon col={c.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(group => (
              <React.Fragment key={group.key}>
                {groupBy !== 'none' && (
                  <tr
                    className="border-b border-surface-container-high bg-surface-container/60 cursor-pointer"
                    onClick={() => setCollapsed(s => { const n = new Set(s); n.has(group.key) ? n.delete(group.key) : n.add(group.key); return n; })}
                  >
                    <td colSpan={8} className="px-3 py-2 font-semibold text-on-surface-variant flex items-center gap-1">
                      <ChevronRight className={cn('w-3 h-3 transition-transform', !collapsed.has(group.key) && 'rotate-90')} />
                      {group.label} <span className="font-normal text-on-surface-variant/60">({group.tasks.length})</span>
                    </td>
                  </tr>
                )}
                {!collapsed.has(group.key) && group.tasks.map(task => (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick(task.id)}
                    className="border-b border-surface-container-high/50 hover:bg-surface-container/40 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2 text-on-surface font-medium max-w-[200px] truncate">{task.title}</td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">{STATUS_LABELS[task.status] ?? task.status}</td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">{task.priority}</td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">{getClientName(task.clientId)}</td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">{getProjectName(task.projectId)}</td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">{task.assignees?.join(', ')}</td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">{task.startDate ?? '—'}</td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">{task.dueDate ?? '—'}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
