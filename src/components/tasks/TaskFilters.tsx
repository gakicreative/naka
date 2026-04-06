import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Client, Project, TeamUser } from '../../store';

export interface TaskFiltersState {
  clientIds: string[];
  projectIds: string[];
  assigneeNames: string[];
}

interface TaskFiltersProps {
  filters: TaskFiltersState;
  clients: Client[];
  projects: Project[];
  teamUsers: TeamUser[];
  onChange: (filters: TaskFiltersState) => void;
  onClear: () => void;
}

function MultiSelect({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
          selected.length > 0
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-surface-container-high bg-surface-container text-on-surface-variant hover:text-on-surface'
        )}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-primary text-on-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
            {selected.length}
          </span>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] bg-surface-container-low border border-surface-container-high rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
          {options.length === 0 && (
            <p className="px-3 py-2 text-xs text-on-surface-variant">Nenhuma opção</p>
          )}
          {options.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => onToggle(opt.id)}
                className="accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskFilters({ filters, clients, projects, teamUsers, onChange, onClear }: TaskFiltersProps) {
  const activeCount = filters.clientIds.length + filters.projectIds.length + filters.assigneeNames.length;

  const availableProjects = filters.clientIds.length > 0
    ? projects.filter(p => filters.clientIds.includes((p as { clientId?: string }).clientId ?? ''))
    : projects;

  const toggle = (key: keyof TaskFiltersState, id: string) => {
    const current = filters[key] as string[];
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    const updated = { ...filters, [key]: next };
    if (key === 'clientIds') updated.projectIds = [];
    onChange(updated);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <MultiSelect
        label="Cliente"
        options={clients.map(c => ({ id: c.id, label: c.name }))}
        selected={filters.clientIds}
        onToggle={id => toggle('clientIds', id)}
      />
      <MultiSelect
        label="Projeto"
        options={availableProjects.map(p => ({ id: p.id, label: p.name }))}
        selected={filters.projectIds}
        onToggle={id => toggle('projectIds', id)}
      />
      <MultiSelect
        label="Responsável"
        options={teamUsers.map(u => ({ id: u.name, label: u.name }))}
        selected={filters.assigneeNames}
        onToggle={id => toggle('assigneeNames', id)}
      />
      {activeCount > 0 && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-error transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpar ({activeCount})
        </button>
      )}
      {activeCount === 0 && <Filter className="w-4 h-4 text-on-surface-variant/40" />}
    </div>
  );
}
