import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import type { ProjectMember, ProjectObjective, ProjectDoc, Transaction } from '../store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Pencil, Trash2, ExternalLink, Download,
  Plus, X, Check, ChevronDown, Kanban, DollarSign,
  Users, Target, FileText, Layers, TrendingUp, TrendingDown,
  Lock,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BrandCard } from '../components/brandhub/BrandCard';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Section({
  title, icon, children, editing, onEdit, onSave, onCancel,
  hideEditButton, defaultOpen = true,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  hideEditButton?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 flex-1 min-w-0 focus:outline-none"
        >
          {icon && <span className="text-on-surface-variant flex-shrink-0">{icon}</span>}
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          <ChevronDown
            className="w-4 h-4 text-on-surface-variant transition-transform duration-200 flex-shrink-0 ml-1"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
        {open && !hideEditButton && !editing && (
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors ml-2 flex-shrink-0">
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {open && editing && (
          <div className="flex gap-2 ml-2 flex-shrink-0">
            <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
              <X className="w-4 h-4" />
            </button>
            <button onClick={onSave} className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-on-surface-variant/60 italic">{children}</p>;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = 'overview' | 'brand' | 'kanban' | 'finances';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Visão Geral', icon: <Layers className="w-4 h-4" /> },
  { id: 'brand', label: 'Brand', icon: <Pencil className="w-4 h-4" /> },
  { id: 'kanban', label: 'Kanban', icon: <Kanban className="w-4 h-4" /> },
  { id: 'finances', label: 'Finanças', icon: <DollarSign className="w-4 h-4" /> },
];

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OBJ_STATUS: Record<ProjectObjective['status'], { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-surface-container text-on-surface-variant' },
  'in-progress': { label: 'Em andamento', color: 'bg-blue-500/10 text-blue-400' },
  done: { label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-400' },
};

const DOC_TYPES: Record<ProjectDoc['type'], { label: string; color: string }> = {
  brief: { label: 'Brief', color: 'bg-blue-500/10 text-blue-400' },
  spec: { label: 'Especificação', color: 'bg-purple-500/10 text-purple-400' },
  report: { label: 'Relatório', color: 'bg-amber-500/10 text-amber-400' },
  other: { label: 'Outro', color: 'bg-surface-container text-on-surface-variant' },
};

function InfoSection({ projectId, description, notes }: { projectId: string; description?: string; notes?: string }) {
  const updateProject = useStore((s) => s.updateProject);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ description: description ?? '', notes: notes ?? '' });

  useEffect(() => {
    setDraft({ description: description ?? '', notes: notes ?? '' });
  }, [description, notes]);

  const save = () => {
    updateProject(projectId, { description: draft.description || undefined, notes: draft.notes || undefined });
    setEditing(false);
    toast.success('Informações atualizadas');
  };

  return (
    <Section
      title="Informações do Projeto"
      icon={<Layers className="w-4 h-4" />}
      editing={editing}
      onEdit={() => setEditing(true)}
      onSave={save}
      onCancel={() => { setDraft({ description: description ?? '', notes: notes ?? '' }); setEditing(false); }}
    >
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Descrição</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Observações internas</label>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {description && <p className="text-sm text-on-surface leading-relaxed">{description}</p>}
          {notes && (
            <div className="p-3 bg-surface-container border-l-2 border-primary/40 rounded-r-lg">
              <p className="text-xs text-on-surface-variant mb-0.5 font-medium">Observações internas</p>
              <p className="text-sm text-on-surface-variant">{notes}</p>
            </div>
          )}
          {!description && !notes && <EmptyHint>Nenhuma informação cadastrada.</EmptyHint>}
        </div>
      )}
    </Section>
  );
}

function ObjectivesSection({ projectId, objectives }: { projectId: string; objectives?: ProjectObjective[] }) {
  const updateProject = useStore((s) => s.updateProject);
  const list = objectives ?? [];
  const [newTitle, setNewTitle] = useState('');

  const add = () => {
    const title = newTitle.trim();
    if (!title) return;
    updateProject(projectId, { objectives: [...list, { id: crypto.randomUUID(), title, status: 'pending' }] });
    setNewTitle('');
  };

  const cycle = (id: string) => {
    const obj = list.find((o) => o.id === id);
    if (!obj) return;
    const next: ProjectObjective['status'] = obj.status === 'pending' ? 'in-progress' : obj.status === 'in-progress' ? 'done' : 'pending';
    updateProject(projectId, { objectives: list.map((o) => o.id === id ? { ...o, status: next } : o) });
  };

  const remove = (id: string) => updateProject(projectId, { objectives: list.filter((o) => o.id !== id) });

  return (
    <Section
      title="Objetivos"
      icon={<Target className="w-4 h-4" />}
      editing={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      hideEditButton
    >
      <div className="space-y-2">
        {list.map((obj) => {
          const st = OBJ_STATUS[obj.status];
          return (
            <div key={obj.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
              <button onClick={() => cycle(obj.id)} className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors', st.color)}>
                {st.label}
              </button>
              <span className="flex-1 text-sm text-on-surface">{obj.title}</span>
              {obj.dueDate && <span className="text-xs text-on-surface-variant flex-shrink-0">{obj.dueDate}</span>}
              <button onClick={() => remove(obj.id)} className="p-1 rounded hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {list.length === 0 && <EmptyHint>Nenhum objetivo cadastrado.</EmptyHint>}
        <div className="flex gap-2 pt-1">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Novo objetivo..."
            className="flex-1 px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={add} disabled={!newTitle.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-40">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Section>
  );
}

function TeamSection({
  projectId, teamMembers, canEdit,
}: { projectId: string; teamMembers?: ProjectMember[]; canEdit: boolean }) {
  const updateProject = useStore((s) => s.updateProject);
  const list = teamMembers ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', role: '', email: '' });

  const add = () => {
    if (!draft.name.trim()) return;
    updateProject(projectId, { teamMembers: [...list, { ...draft, id: crypto.randomUUID() }] });
    setDraft({ name: '', role: '', email: '' });
    setAdding(false);
  };

  const remove = (id: string) => {
    if (!canEdit) return;
    updateProject(projectId, { teamMembers: list.filter((m) => m.id !== id) });
  };

  return (
    <Section
      title="Equipe"
      icon={<Users className="w-4 h-4" />}
      editing={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      hideEditButton
    >
      <div className="space-y-2">
        {list.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface">{m.name}</p>
              <p className="text-xs text-on-surface-variant">{m.role}{m.email ? ` • ${m.email}` : ''}</p>
            </div>
            {canEdit && (
              <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {list.length === 0 && <EmptyHint>Nenhum membro na equipe.</EmptyHint>}
        {canEdit && (
          adding ? (
            <div className="p-3 bg-surface-container-low border border-dashed border-surface-container-high rounded-xl space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nome" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface" />
                <input value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} placeholder="Função" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface" />
                <input value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="E-mail (opcional)" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface col-span-2" />
              </div>
              <div className="flex gap-2">
                <button onClick={add} disabled={!draft.name.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-40">Adicionar</button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg">Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" /> Adicionar membro
            </button>
          )
        )}
      </div>
    </Section>
  );
}

function DocsSection({ projectId, documents }: { projectId: string; documents?: ProjectDoc[] }) {
  const updateProject = useStore((s) => s.updateProject);
  const list = documents ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: '', url: '', type: 'brief' as ProjectDoc['type'] });

  const add = () => {
    if (!draft.title.trim() || !draft.url.trim()) return;
    updateProject(projectId, {
      documents: [...list, { ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10) }],
    });
    setDraft({ title: '', url: '', type: 'brief' });
    setAdding(false);
  };

  const remove = (id: string) => updateProject(projectId, { documents: list.filter((d) => d.id !== id) });

  return (
    <Section
      title="Documentos"
      icon={<FileText className="w-4 h-4" />}
      editing={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      hideEditButton
    >
      <div className="space-y-2">
        {list.map((doc) => {
          const dt = DOC_TYPES[doc.type];
          return (
            <div key={doc.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0', dt.color)}>{dt.label}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface line-clamp-1">{doc.title}</p>
                <p className="text-xs text-on-surface-variant">{doc.createdAt}</p>
              </div>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button onClick={() => remove(doc.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {list.length === 0 && <EmptyHint>Nenhum documento cadastrado.</EmptyHint>}
        {adding ? (
          <div className="p-3 bg-surface-container-low border border-dashed border-surface-container-high rounded-xl space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Título" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface" />
              <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as ProjectDoc['type'] }))} className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface">
                <option value="brief">Brief</option>
                <option value="spec">Especificação</option>
                <option value="report">Relatório</option>
                <option value="other">Outro</option>
              </select>
              <input value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} placeholder="URL do documento" className="col-span-2 px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface" />
            </div>
            <div className="flex gap-2">
              <button onClick={add} disabled={!draft.title.trim() || !draft.url.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-40">Adicionar</button>
              <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Plus className="w-4 h-4" /> Novo documento
          </button>
        )}
      </div>
    </Section>
  );
}

// ─── Brand Tab ────────────────────────────────────────────────────────────────

function BrandTab({ projectId }: { projectId: string }) {
  const brandhubs = useStore((s) => s.brandhubs);
  const upsertBrandHub = useStore((s) => s.upsertBrandHub);
  const session = useStore((s) => s.session);
  const hub = brandhubs.find((h) => h.scope === 'project' && h.projectId === projectId);

  const createHub = async () => {
    await upsertBrandHub({
      userId: session?.name ?? '',
      scope: 'project',
      projectId,
      brandName: 'Brand do Projeto',
      colors: [],
      fonts: [],
      logos: [],
      keywords: [],
      identity: { nicho: '', publicoAlvo: '', tomDeVoz: '', slogan: '', concorrentes: '', restricoesVisuais: '' },
      figmaLink: '',
      moodboardUrl: '',
    });
    toast.success('Brand Hub criado para este projeto');
  };

  if (!hub) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-on-surface-variant">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
          <Pencil className="w-8 h-8 text-on-surface-variant/40" />
        </div>
        <div className="text-center">
          <p className="font-medium text-on-surface">Nenhum Brand Hub neste projeto</p>
          <p className="text-sm mt-1">Crie um Brand Hub exclusivo para este projeto.</p>
        </div>
        <button
          onClick={createHub}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Criar Brand Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <BrandCard hub={hub} />
      </div>
      <Link
        to={`/app/brand-hub/${hub.id}`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container border border-surface-container-high rounded-xl text-sm text-on-surface hover:border-primary/50 transition-colors"
      >
        <ExternalLink className="w-4 h-4 text-on-surface-variant" /> Abrir Brand Hub completo
      </Link>
    </div>
  );
}

// ─── Kanban Tab ───────────────────────────────────────────────────────────────

function KanbanTab({ projectId }: { projectId: string }) {
  const tasks = useStore((s) => s.tasks);
  const projectTasks = tasks.filter((t) => t.projectId === projectId && t.status !== 'archived');

  const counts = {
    todo: projectTasks.filter((t) => t.status === 'todo').length,
    'in-progress': projectTasks.filter((t) => t.status === 'in-progress').length,
    review: projectTasks.filter((t) => t.status === 'review').length,
    done: projectTasks.filter((t) => t.status === 'done').length,
  };

  const COLS = [
    { key: 'todo', label: 'A fazer', color: 'bg-surface-container text-on-surface-variant' },
    { key: 'in-progress', label: 'Em progresso', color: 'bg-blue-500/10 text-blue-400' },
    { key: 'review', label: 'Revisão', color: 'bg-amber-500/10 text-amber-400' },
    { key: 'done', label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-400' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {COLS.map(({ key, label, color }) => (
          <div key={key} className="p-4 bg-surface-container-low border border-surface-container-high rounded-2xl">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', color)}>{label}</span>
            <p className="text-2xl font-bold text-on-surface mt-2">{counts[key]}</p>
            <p className="text-xs text-on-surface-variant">tarefas</p>
          </div>
        ))}
      </div>

      {/* Recent tasks */}
      {projectTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Tarefas recentes</p>
          {projectTasks.slice(0, 5).map((task) => {
            const st = COLS.find((c) => c.key === task.status);
            return (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0', st?.color)}>{st?.label}</span>
                <span className="flex-1 text-sm text-on-surface">{task.title}</span>
                <span className="text-xs text-on-surface-variant flex-shrink-0">{task.dueDate}</span>
              </div>
            );
          })}
        </div>
      )}

      {projectTasks.length === 0 && (
        <p className="text-sm text-on-surface-variant/60 italic text-center py-8">
          Nenhuma tarefa neste projeto ainda.
        </p>
      )}

      <Link
        to={`/app/projects/${projectId}/tasks`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
      >
        <Kanban className="w-4 h-4" /> Abrir Kanban completo
      </Link>
    </div>
  );
}

// ─── Finances Tab ─────────────────────────────────────────────────────────────

function FinancesTab({ projectId, budget }: { projectId: string; budget?: number }) {
  const transactions = useStore((s) => s.transactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const updateProject = useStore((s) => s.updateProject);

  const list = transactions.filter((t) => t.projectId === projectId);
  const income = list.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const expense = list.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const [adding, setAdding] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [draftBudget, setDraftBudget] = useState(budget ?? 0);
  const [draft, setDraft] = useState<Omit<Transaction, 'id' | 'projectId' | 'createdAt'>>({
    description: '', amount: 0, type: 'in', category: '', date: new Date().toISOString().slice(0, 10), status: 'paid',
  });

  const STATUS_COLORS: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-400',
    pending: 'bg-amber-500/10 text-amber-400',
    overdue: 'bg-error/10 text-error',
  };

  const add = () => {
    if (!draft.description.trim()) return;
    addTransaction({ ...draft, projectId, createdAt: new Date().toISOString() });
    setDraft({ description: '', amount: 0, type: 'in', category: '', date: new Date().toISOString().slice(0, 10), status: 'paid' });
    setAdding(false);
  };

  const saveBudget = () => {
    updateProject(projectId, { budget: draftBudget });
    setEditingBudget(false);
    toast.success('Orçamento atualizado');
  };

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-2xl">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-surface-container-high" />
            <p className="text-xs text-on-surface-variant">Orçamento</p>
          </div>
          {editingBudget ? (
            <div className="flex gap-1 items-center">
              <input
                type="number"
                value={draftBudget}
                onChange={(e) => setDraftBudget(Number(e.target.value))}
                className="flex-1 px-2 py-1 bg-surface-variant rounded text-sm text-on-surface border-none focus:ring-1 focus:ring-primary w-20"
              />
              <button onClick={saveBudget} className="p-1 rounded bg-primary/10 text-primary"><Check className="w-3 h-3" /></button>
              <button onClick={() => setEditingBudget(false)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold text-on-surface">{budget ? fmt(budget) : '—'}</p>
              <button onClick={() => { setDraftBudget(budget ?? 0); setEditingBudget(true); }} className="p-0.5 rounded text-on-surface-variant hover:text-on-surface transition-colors">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-2xl">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <p className="text-xs text-on-surface-variant">Receitas</p>
          </div>
          <p className="text-lg font-bold text-emerald-400">{fmt(income)}</p>
        </div>
        <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-2xl">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="w-3 h-3 text-error" />
            <p className="text-xs text-on-surface-variant">Despesas</p>
          </div>
          <p className="text-lg font-bold text-error">{fmt(expense)}</p>
        </div>
        <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-2xl">
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign className="w-3 h-3 text-primary" />
            <p className="text-xs text-on-surface-variant">Saldo</p>
          </div>
          <p className={cn('text-lg font-bold', balance >= 0 ? 'text-emerald-400' : 'text-error')}>{fmt(balance)}</p>
        </div>
      </div>

      {/* Transactions list */}
      <div className="space-y-2">
        {list.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className={cn('w-1 self-stretch rounded-full flex-shrink-0', tx.type === 'in' ? 'bg-emerald-400' : 'bg-error')} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface">{tx.description}</p>
              <p className="text-xs text-on-surface-variant">{tx.category} • {tx.date}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', STATUS_COLORS[tx.status] ?? 'bg-surface-container text-on-surface-variant')}>{tx.status}</span>
              <p className={cn('text-sm font-semibold', tx.type === 'in' ? 'text-emerald-400' : 'text-error')}>
                {tx.type === 'in' ? '+' : '-'}{fmt(tx.amount)}
              </p>
              <button onClick={() => deleteTransaction(tx.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-on-surface-variant/60 italic text-center py-6">Nenhuma transação neste projeto.</p>}
      </div>

      {adding ? (
        <div className="p-4 bg-surface-container-low border border-dashed border-surface-container-high rounded-xl space-y-3">
          <p className="text-sm font-medium text-on-surface">Nova transação</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Descrição" className="col-span-2 px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface" />
            <input type="number" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: Number(e.target.value) }))} placeholder="Valor (R$)" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface" />
            <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as 'in' | 'out' }))} className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface">
              <option value="in">Receita</option>
              <option value="out">Despesa</option>
            </select>
            <input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Categoria" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface" />
            <input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface" />
            <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))} className="col-span-2 px-3 py-1.5 bg-surface-variant rounded-lg text-sm border-none focus:ring-1 focus:ring-primary text-on-surface">
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="overdue">Atrasado</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={add} disabled={!draft.description.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-40">Adicionar</button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
          <Plus className="w-4 h-4" /> Nova transação
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  Planejamento: 'bg-surface-container text-on-surface-variant',
  'Em Andamento': 'bg-blue-500/10 text-blue-400',
  Revisão: 'bg-amber-500/10 text-amber-400',
  Finalizado: 'bg-emerald-500/10 text-emerald-400',
};

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projects = useStore((s) => s.projects);
  const deleteProject = useStore((s) => s.deleteProject);
  const updateProject = useStore((s) => s.updateProject);
  const session = useStore((s) => s.session);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const project = projects.find((p) => p.id === projectId);

  const isAdmin = session?.role === 'admin';
  const isSocio = session?.role === 'socio';
  const isSeeder = session?.role === 'seeder';

  // Access control: admin + socio see all; seeder only if in teamMembers
  const hasAccess = isAdmin || isSocio ||
    (isSeeder && project?.teamMembers?.some((m) => m.name === session?.name));

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center gap-4 text-on-surface-variant">
        <p>Projeto não encontrado.</p>
        <button onClick={() => navigate('/app/projects')} className="text-primary hover:underline text-sm">← Voltar</button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center gap-4 text-on-surface-variant">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
          <Lock className="w-8 h-8 text-on-surface-variant/40" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-on-surface">Acesso restrito</p>
          <p className="text-sm mt-1">Você não tem permissão para visualizar este projeto.</p>
        </div>
        <button onClick={() => navigate('/app/projects')} className="text-primary hover:underline text-sm">← Voltar para projetos</button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm(`Excluir "${project.name}"? Esta ação não pode ser desfeita.`)) return;
    await deleteProject(project.id);
    toast.success('Projeto excluído.');
    navigate('/app/projects');
  };

  const [editingProgress, setEditingProgress] = useState(false);
  const [draftProgress, setDraftProgress] = useState(project.progress);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back */}
      <button
        onClick={() => navigate('/app/projects')}
        className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-white/10 overflow-hidden"
        style={{ background: 'linear-gradient(to bottom left, #1a3a2a 0%, #000000 100%)' }}
      >
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold leading-tight">{project.name}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STAGE_COLORS[project.stage] ?? 'bg-surface-container text-on-surface-variant')}>
                    {project.stage}
                  </span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                    project.status === 'Ativo' ? 'bg-emerald-500/15 text-emerald-400' :
                    project.status === 'Concluído' ? 'bg-primary/15 text-primary' :
                    'bg-amber-500/15 text-amber-400'
                  )}>
                    {project.status}
                  </span>
                  <span className="text-white/40 text-xs">Prazo: {project.dueDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAdmin && (
                <button onClick={handleDelete} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Progresso</span>
              {editingProgress ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draftProgress}
                    onChange={(e) => setDraftProgress(Number(e.target.value))}
                    className="w-16 px-2 py-0.5 bg-white/10 text-white text-xs rounded border border-white/20 focus:outline-none"
                  />
                  <button onClick={() => { updateProject(project.id, { progress: draftProgress }); setEditingProgress(false); toast.success('Progresso atualizado'); }} className="p-1 rounded bg-white/20 hover:bg-white/30 text-white">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => { setDraftProgress(project.progress); setEditingProgress(false); }} className="p-1 rounded bg-white/10 text-white/60">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setDraftProgress(project.progress); setEditingProgress(true); }} className="flex items-center gap-1 text-white text-sm font-bold hover:opacity-70 transition-opacity">
                  {project.progress}% <Pencil className="w-3 h-3 ml-0.5 opacity-60" />
                </button>
              )}
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-container-low border border-surface-container-high rounded-2xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="space-y-4"
        >
          {activeTab === 'overview' && (
            <>
              <InfoSection projectId={project.id} description={project.description} notes={project.notes} />
              <ObjectivesSection projectId={project.id} objectives={project.objectives} />
              <TeamSection projectId={project.id} teamMembers={project.teamMembers} canEdit={isAdmin} />
              <DocsSection projectId={project.id} documents={project.documents} />
            </>
          )}
          {activeTab === 'brand' && <BrandTab projectId={project.id} />}
          {activeTab === 'kanban' && <KanbanTab projectId={project.id} />}
          {activeTab === 'finances' && <FinancesTab projectId={project.id} budget={project.budget} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
