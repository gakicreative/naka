import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import type {
  ClientObjective, ClientContract, ClientInvoice,
  ClientMarketingDoc, ClientStrategy, ClientLegalInfo, ClientContact,
} from '../store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Pencil, Trash2, ExternalLink, Download,
  Plus, X, Check, ChevronDown, Globe, Kanban,
  FileText, Target, DollarSign, Users, Shield, Layers,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BrandCard } from '../components/brandhub/BrandCard';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Section({
  title, icon, children, editing, onEdit, onSave, onCancel, hideEditButton, defaultOpen = true,
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

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-on-surface-variant mb-0.5">{label}</dt>
      <dd className="text-sm text-on-surface">{value}</dd>
    </div>
  );
}

// ─── Company Info ─────────────────────────────────────────────────────────────

function CompanySection({ clientId, description, website, figmaLink }: {
  clientId: string;
  description?: string;
  website?: string;
  figmaLink?: string;
}) {
  const updateClient = useStore((s) => s.updateClient);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ description: description ?? '', website: website ?? '', figmaLink: figmaLink ?? '' });

  useEffect(() => {
    setDraft({ description: description ?? '', website: website ?? '', figmaLink: figmaLink ?? '' });
  }, [description, website, figmaLink]);

  const save = () => {
    updateClient(clientId, {
      description: draft.description || undefined,
      website: draft.website || undefined,
      figmaLink: draft.figmaLink || undefined,
    });
    setEditing(false);
    toast.success('Informações atualizadas');
  };

  return (
    <Section
      title="Informações da Empresa"
      icon={<Layers className="w-4 h-4" />}
      editing={editing}
      onEdit={() => setEditing(true)}
      onSave={save}
      onCancel={() => { setDraft({ description: description ?? '', website: website ?? '', figmaLink: figmaLink ?? '' }); setEditing(false); }}
    >
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Descrição</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Website</label>
            <input value={draft.website} onChange={(e) => setDraft((d) => ({ ...d, website: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Figma Principal</label>
            <input value={draft.figmaLink} onChange={(e) => setDraft((d) => ({ ...d, figmaLink: e.target.value }))} placeholder="https://figma.com/file/..." className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {description && <p className="text-sm text-on-surface leading-relaxed">{description}</p>}
          <div className="flex flex-wrap gap-3">
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-surface-container-high rounded-xl text-sm text-on-surface hover:border-primary/50 transition-colors">
                <Globe className="w-3.5 h-3.5 text-on-surface-variant" /> Site
              </a>
            )}
            {figmaLink && (
              <a href={figmaLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-surface-container-high rounded-xl text-sm text-on-surface hover:border-primary/50 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant" /> Figma
              </a>
            )}
          </div>
          {!description && !website && !figmaLink && <EmptyHint>Nenhuma informação cadastrada.</EmptyHint>}
        </div>
      )}
    </Section>
  );
}

// ─── Objectives ───────────────────────────────────────────────────────────────

const OBJ_STATUS: Record<ClientObjective['status'], { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-surface-container text-on-surface-variant' },
  'in-progress': { label: 'Em andamento', color: 'bg-blue-500/10 text-blue-400' },
  done: { label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-400' },
};

function ObjectivesSection({ clientId, objectives }: { clientId: string; objectives?: ClientObjective[] }) {
  const updateClient = useStore((s) => s.updateClient);
  const list = objectives ?? [];
  const [newTitle, setNewTitle] = useState('');

  const add = () => {
    const title = newTitle.trim();
    if (!title) return;
    updateClient(clientId, {
      objectives: [...list, { id: crypto.randomUUID(), title, status: 'pending' }],
    });
    setNewTitle('');
  };

  const toggle = (id: string) => {
    const obj = list.find((o) => o.id === id);
    if (!obj) return;
    const next: ClientObjective['status'] = obj.status === 'pending' ? 'in-progress' : obj.status === 'in-progress' ? 'done' : 'pending';
    updateClient(clientId, { objectives: list.map((o) => o.id === id ? { ...o, status: next } : o) });
  };

  const remove = (id: string) => updateClient(clientId, { objectives: list.filter((o) => o.id !== id) });

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
              <button
                onClick={() => toggle(obj.id)}
                className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors', st.color)}
              >
                {st.label}
              </button>
              <span className="flex-1 text-sm text-on-surface">{obj.title}</span>
              {obj.dueDate && <span className="text-xs text-on-surface-variant flex-shrink-0">{obj.dueDate}</span>}
              <button onClick={() => remove(obj.id)} className="p-1 rounded hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors flex-shrink-0">
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
          <button onClick={add} disabled={!newTitle.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Section>
  );
}

// ─── Contract ─────────────────────────────────────────────────────────────────

const CONTRACT_STATUS: Record<ClientContract['status'], { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-400' },
  expired: { label: 'Expirado', color: 'bg-error/10 text-error' },
  pending: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-400' },
};

function ContractSection({ clientId, contract }: { clientId: string; contract?: ClientContract }) {
  const updateClient = useStore((s) => s.updateClient);
  const [editing, setEditing] = useState(false);
  const empty: ClientContract = { startDate: '', endDate: '', value: 0, status: 'pending' };
  const [draft, setDraft] = useState<ClientContract>(contract ?? empty);

  useEffect(() => { setDraft(contract ?? empty); }, [contract]);

  const save = () => {
    updateClient(clientId, { contract: draft });
    setEditing(false);
    toast.success('Contrato atualizado');
  };

  const st = contract ? CONTRACT_STATUS[contract.status] : null;

  return (
    <Section
      title="Contrato"
      icon={<FileText className="w-4 h-4" />}
      editing={editing}
      onEdit={() => setEditing(true)}
      onSave={save}
      onCancel={() => { setDraft(contract ?? empty); setEditing(false); }}
    >
      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'startDate', label: 'Início', type: 'date' },
            { key: 'endDate', label: 'Término', type: 'date' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
              <input
                type={type}
                value={(draft as Record<string, unknown>)[key] as string ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Valor mensal (R$)</label>
            <input
              type="number"
              value={draft.value}
              onChange={(e) => setDraft((d) => ({ ...d, value: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Status</label>
            <select
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as ClientContract['status'] }))}
              className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
            >
              <option value="pending">Pendente</option>
              <option value="active">Ativo</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-on-surface-variant mb-1">Descrição / Escopo</label>
            <textarea
              value={draft.description ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-on-surface-variant mb-1">Link do documento</label>
            <input
              value={draft.documentUrl ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, documentUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      ) : contract ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Valor</p>
              <p className="text-sm font-semibold text-on-surface">
                {contract.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Início</p>
              <p className="text-sm text-on-surface">{contract.startDate}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Término</p>
              <p className="text-sm text-on-surface">{contract.endDate}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Status</p>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', st?.color)}>{st?.label}</span>
            </div>
          </div>
          {contract.description && <p className="text-sm text-on-surface-variant">{contract.description}</p>}
          {contract.documentUrl && (
            <a href={contract.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline w-fit">
              <Download className="w-3.5 h-3.5" /> Ver documento
            </a>
          )}
        </div>
      ) : (
        <EmptyHint>Nenhum contrato cadastrado.</EmptyHint>
      )}
    </Section>
  );
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

const INV_STATUS: Record<ClientInvoice['status'], { label: string; color: string }> = {
  paid: { label: 'Pago', color: 'bg-emerald-500/10 text-emerald-400' },
  pending: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-400' },
  overdue: { label: 'Atrasado', color: 'bg-error/10 text-error' },
};

function InvoicesSection({ clientId, invoices }: { clientId: string; invoices?: ClientInvoice[] }) {
  const updateClient = useStore((s) => s.updateClient);
  const list = invoices ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<ClientInvoice, 'id'>>({ number: '', amount: 0, dueDate: '', status: 'pending' });

  const add = () => {
    if (!draft.number.trim()) return;
    updateClient(clientId, { invoices: [...list, { ...draft, id: crypto.randomUUID() }] });
    setDraft({ number: '', amount: 0, dueDate: '', status: 'pending' });
    setAdding(false);
    toast.success('Fatura adicionada');
  };

  const remove = (id: string) => updateClient(clientId, { invoices: list.filter((i) => i.id !== id) });

  const total = list.reduce((sum, i) => sum + i.amount, 0);
  const paid = list.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

  return (
    <Section
      title="Faturas"
      icon={<DollarSign className="w-4 h-4" />}
      editing={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      hideEditButton
    >
      <div className="space-y-3">
        {list.length > 0 && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container border border-surface-container-high rounded-xl">
            <div>
              <p className="text-xs text-on-surface-variant">Total emitido</p>
              <p className="text-sm font-semibold text-on-surface">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Total pago</p>
              <p className="text-sm font-semibold text-emerald-400">{paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {list.map((inv) => {
            const st = INV_STATUS[inv.status];
            return (
              <div key={inv.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-on-surface">#{inv.number}</p>
                    <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', st.color)}>{st.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Vence: {inv.dueDate}</p>
                </div>
                <p className="text-sm font-semibold text-on-surface flex-shrink-0">
                  {inv.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {inv.documentUrl && (
                  <a href={inv.documentUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={() => remove(inv.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {list.length === 0 && <EmptyHint>Nenhuma fatura cadastrada.</EmptyHint>}
        </div>

        {adding ? (
          <div className="p-3 bg-surface-container-low border border-dashed border-surface-container-high rounded-xl space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={draft.number} onChange={(e) => setDraft((d) => ({ ...d, number: e.target.value }))} placeholder="Número (ex: 2024-001)" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
              <input type="number" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: Number(e.target.value) }))} placeholder="Valor (R$)" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
              <input type="date" value={draft.dueDate} onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))} className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
              <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as ClientInvoice['status'] }))} className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary">
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Atrasado</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={add} disabled={!draft.number.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">Adicionar</button>
              <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Plus className="w-4 h-4" /> Nova fatura
          </button>
        )}
      </div>
    </Section>
  );
}

// ─── Marketing Docs ───────────────────────────────────────────────────────────

const DOC_TYPES: Record<ClientMarketingDoc['type'], { label: string; color: string }> = {
  brief: { label: 'Brief', color: 'bg-blue-500/10 text-blue-400' },
  report: { label: 'Relatório', color: 'bg-purple-500/10 text-purple-400' },
  presentation: { label: 'Apresentação', color: 'bg-amber-500/10 text-amber-400' },
  other: { label: 'Outro', color: 'bg-surface-container text-on-surface-variant' },
};

function MarketingDocsSection({ clientId, docs }: { clientId: string; docs?: ClientMarketingDoc[] }) {
  const updateClient = useStore((s) => s.updateClient);
  const list = docs ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: '', url: '', type: 'brief' as ClientMarketingDoc['type'] });

  const add = () => {
    if (!draft.title.trim() || !draft.url.trim()) return;
    updateClient(clientId, {
      marketingDocs: [...list, { ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10) }],
    });
    setDraft({ title: '', url: '', type: 'brief' });
    setAdding(false);
  };

  const remove = (id: string) => updateClient(clientId, { marketingDocs: list.filter((d) => d.id !== id) });

  return (
    <Section
      title="Documentos de Marketing"
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
              <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Título do documento" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
              <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as ClientMarketingDoc['type'] }))} className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary">
                <option value="brief">Brief</option>
                <option value="report">Relatório</option>
                <option value="presentation">Apresentação</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <input value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} placeholder="URL do documento" className="w-full px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
            <div className="flex gap-2">
              <button onClick={add} disabled={!draft.title.trim() || !draft.url.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">Adicionar</button>
              <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
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

// ─── Strategy ─────────────────────────────────────────────────────────────────

const STRATEGY_FIELDS: { key: keyof ClientStrategy; label: string; multiline?: boolean }[] = [
  { key: 'goals', label: 'Objetivos estratégicos', multiline: true },
  { key: 'positioning', label: 'Posicionamento', multiline: true },
  { key: 'channels', label: 'Canais de atuação', multiline: true },
  { key: 'kpis', label: 'KPIs e métricas', multiline: true },
  { key: 'notes', label: 'Observações', multiline: true },
];

function StrategySection({ clientId, strategy }: { clientId: string; strategy?: ClientStrategy }) {
  const updateClient = useStore((s) => s.updateClient);
  const [editing, setEditing] = useState(false);
  const empty: ClientStrategy = {};
  const [draft, setDraft] = useState<ClientStrategy>(strategy ?? empty);

  useEffect(() => { setDraft(strategy ?? empty); }, [strategy]);

  const save = () => {
    updateClient(clientId, { strategy: draft });
    setEditing(false);
    toast.success('Estratégia atualizada');
  };

  const hasData = strategy && Object.values(strategy).some(Boolean);

  return (
    <Section
      title="Estratégia"
      icon={<Target className="w-4 h-4" />}
      editing={editing}
      onEdit={() => setEditing(true)}
      onSave={save}
      onCancel={() => { setDraft(strategy ?? empty); setEditing(false); }}
    >
      {editing ? (
        <div className="space-y-3">
          {STRATEGY_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
              <textarea
                value={draft[key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          ))}
        </div>
      ) : hasData ? (
        <dl className="space-y-4">
          {STRATEGY_FIELDS.map(({ key, label }) => {
            const val = strategy?.[key];
            if (!val) return null;
            return (
              <div key={key}>
                <dt className="text-xs text-on-surface-variant mb-0.5">{label}</dt>
                <dd className="text-sm text-on-surface whitespace-pre-line">{val}</dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <EmptyHint>Nenhuma estratégia cadastrada.</EmptyHint>
      )}
    </Section>
  );
}

// ─── Contacts (admin/socio) ───────────────────────────────────────────────────

function ContactsSection({ clientId, contacts }: { clientId: string; contacts?: ClientContact[] }) {
  const updateClient = useStore((s) => s.updateClient);
  const list = contacts ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', role: '', email: '', phone: '' });

  const add = () => {
    if (!draft.name.trim()) return;
    updateClient(clientId, {
      contacts: [...list, { ...draft, id: crypto.randomUUID(), isPrimary: list.length === 0 }],
    });
    setDraft({ name: '', role: '', email: '', phone: '' });
    setAdding(false);
  };

  const remove = (id: string) => updateClient(clientId, { contacts: list.filter((c) => c.id !== id) });

  return (
    <Section
      title="Contatos"
      icon={<Users className="w-4 h-4" />}
      editing={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      hideEditButton
    >
      <div className="space-y-2">
        {list.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-on-surface">{c.name}</p>
                {c.isPrimary && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">Principal</span>}
              </div>
              <p className="text-xs text-on-surface-variant">{c.role} • {c.email}{c.phone ? ` • ${c.phone}` : ''}</p>
            </div>
            <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {list.length === 0 && <EmptyHint>Nenhum contato cadastrado.</EmptyHint>}

        {adding ? (
          <div className="p-3 bg-surface-container-low border border-dashed border-surface-container-high rounded-xl space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nome" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
              <input value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} placeholder="Cargo" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
              <input value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="E-mail" type="email" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
              <input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="Telefone" className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex gap-2">
              <button onClick={add} disabled={!draft.name.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">Adicionar</button>
              <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Plus className="w-4 h-4" /> Novo contato
          </button>
        )}
      </div>
    </Section>
  );
}

// ─── Legal Info (admin only) ──────────────────────────────────────────────────

const LEGAL_FIELDS: { key: keyof ClientLegalInfo; label: string }[] = [
  { key: 'legalName', label: 'Razão Social' },
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'address', label: 'Endereço' },
  { key: 'taxRegime', label: 'Regime Tributário' },
  { key: 'billingEmail', label: 'E-mail de Cobrança' },
];

function LegalSection({ clientId, legalInfo }: { clientId: string; legalInfo?: ClientLegalInfo }) {
  const updateClient = useStore((s) => s.updateClient);
  const [editing, setEditing] = useState(false);
  const empty: ClientLegalInfo = {};
  const [draft, setDraft] = useState<ClientLegalInfo>(legalInfo ?? empty);

  useEffect(() => { setDraft(legalInfo ?? empty); }, [legalInfo]);

  const save = () => {
    updateClient(clientId, { legalInfo: draft });
    setEditing(false);
    toast.success('Informações legais atualizadas');
  };

  const hasData = legalInfo && Object.values(legalInfo).some(Boolean);

  return (
    <Section
      title="Informações Legais"
      icon={<Shield className="w-4 h-4" />}
      editing={editing}
      onEdit={() => setEditing(true)}
      onSave={save}
      onCancel={() => { setDraft(legalInfo ?? empty); setEditing(false); }}
      defaultOpen={false}
    >
      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LEGAL_FIELDS.map(({ key, label }) => (
            <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
              <input
                value={draft[key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      ) : hasData ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEGAL_FIELDS.map(({ key, label }) => (
            <Field key={key} label={label} value={legalInfo?.[key]} />
          ))}
        </dl>
      ) : (
        <EmptyHint>Nenhuma informação legal cadastrada.</EmptyHint>
      )}
    </Section>
  );
}

// ─── Retainer ─────────────────────────────────────────────────────────────────

function RetainerSection({ client }: { client: { id: string; retainer?: { value: number; hours: number; loggedHours: number; renewalDate: string; healthScore: number; focus: string[] } } }) {
  const r = client.retainer;
  if (!r) return null;

  const pct = Math.round((r.loggedHours / r.hours) * 100);
  const healthColor = r.healthScore >= 70 ? 'text-emerald-400' : r.healthScore >= 40 ? 'text-amber-400' : 'text-error';

  return (
    <Section
      title="Retainer"
      icon={<DollarSign className="w-4 h-4" />}
      editing={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      hideEditButton
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-on-surface-variant mb-0.5">Valor</p>
          <p className="text-sm font-semibold text-on-surface">{r.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant mb-0.5">Horas</p>
          <p className="text-sm font-semibold text-on-surface">{r.loggedHours}h / {r.hours}h ({pct}%)</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant mb-0.5">Renovação</p>
          <p className="text-sm text-on-surface">{r.renewalDate}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant mb-0.5">Health Score</p>
          <p className={cn('text-sm font-semibold', healthColor)}>{r.healthScore}/100</p>
        </div>
      </div>
      {r.focus.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {r.focus.map((f) => (
            <span key={f} className="px-2 py-0.5 rounded-full text-xs bg-surface-container border border-surface-container-high text-on-surface-variant">{f}</span>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── Tab: Tarefas ─────────────────────────────────────────────────────────────

const TASK_COLS = [
  { key: 'todo' as const, label: 'A fazer', color: 'bg-surface-container text-on-surface-variant' },
  { key: 'in-progress' as const, label: 'Em progresso', color: 'bg-blue-500/10 text-blue-400' },
  { key: 'review' as const, label: 'Revisão', color: 'bg-amber-500/10 text-amber-400' },
  { key: 'done' as const, label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-400' },
];

function ClientKanbanTab({ clientId }: { clientId: string }) {
  const tasks = useStore((s) => s.tasks);
  const clientTasks = tasks.filter((t) => t.clientId === clientId && t.status !== 'archived');

  const counts = {
    todo: clientTasks.filter((t) => t.status === 'todo').length,
    'in-progress': clientTasks.filter((t) => t.status === 'in-progress').length,
    review: clientTasks.filter((t) => t.status === 'review').length,
    done: clientTasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TASK_COLS.map(({ key, label, color }) => (
          <div key={key} className="p-4 bg-surface-container-low border border-surface-container-high rounded-2xl">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', color)}>{label}</span>
            <p className="text-2xl font-bold text-on-surface mt-2">{counts[key]}</p>
            <p className="text-xs text-on-surface-variant">tarefas</p>
          </div>
        ))}
      </div>

      {clientTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Tarefas recentes</p>
          {clientTasks.slice(0, 5).map((task) => {
            const col = TASK_COLS.find((c) => c.key === task.status);
            return (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0', col?.color)}>{col?.label}</span>
                <span className="flex-1 text-sm text-on-surface">{task.title}</span>
                <span className="text-xs text-on-surface-variant flex-shrink-0">{task.dueDate}</span>
              </div>
            );
          })}
        </div>
      )}

      {clientTasks.length === 0 && (
        <p className="text-sm text-on-surface-variant/60 italic text-center py-8">Nenhuma tarefa para este cliente ainda.</p>
      )}

      <Link
        to={`/app/clients/${clientId}/tasks`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
      >
        Ver todas as tarefas
      </Link>
    </div>
  );
}

// ─── Tab: Brand ────────────────────────────────────────────────────────────────

function ClientBrandTab({ clientId }: { clientId: string }) {
  const brandhubs = useStore((s) => s.brandhubs);
  const upsertBrandHub = useStore((s) => s.upsertBrandHub);
  const session = useStore((s) => s.session);
  const hub = brandhubs.find((h) => h.scope === 'client' && h.clientId === clientId);

  const createHub = async () => {
    await upsertBrandHub({
      userId: session?.name ?? '',
      scope: 'client',
      clientId,
      brandName: 'Brand do Cliente',
      colors: [],
      fonts: [],
      logos: [],
      keywords: [],
      identity: { nicho: '', publicoAlvo: '', tomDeVoz: '', slogan: '', concorrentes: '', restricoesVisuais: '' },
      figmaLink: '',
      moodboardUrl: '',
    });
    toast.success('Brand Hub criado para este cliente');
  };

  if (!hub) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-on-surface-variant">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
          <Pencil className="w-8 h-8 text-on-surface-variant/40" />
        </div>
        <div className="text-center">
          <p className="font-medium text-on-surface">Nenhum Brand Hub para este cliente</p>
          <p className="text-sm mt-1">Crie um Brand Hub com a identidade visual da marca.</p>
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

// ─── Tabs config ───────────────────────────────────────────────────────────────

type ClientTab = 'overview' | 'info' | 'brand' | 'tasks' | 'finances';

const CLIENT_TABS: { id: ClientTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Visão Geral', icon: <Layers className="w-4 h-4" /> },
  { id: 'info', label: 'Informações', icon: <FileText className="w-4 h-4" /> },
  { id: 'brand', label: 'Brand', icon: <Pencil className="w-4 h-4" /> },
  { id: 'tasks', label: 'Tarefas', icon: <Kanban className="w-4 h-4" /> },
  { id: 'finances', label: 'Finanças', icon: <DollarSign className="w-4 h-4" /> },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const clients = useStore((s) => s.clients);
  const deleteClient = useStore((s) => s.deleteClient);
  const session = useStore((s) => s.session);
  const isAdmin = session?.role === 'admin';
  const canSeeContacts = session?.role === 'admin' || session?.role === 'socio';

  const [activeTab, setActiveTab] = useState<ClientTab>('overview');

  const client = clients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center gap-4 text-on-surface-variant">
        <p>Cliente não encontrado.</p>
        <button onClick={() => navigate('/app/clients')} className="text-primary hover:underline text-sm">← Voltar</button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm(`Excluir "${client.name}"? Esta ação não pode ser desfeita.`)) return;
    await deleteClient(client.id);
    toast.success('Cliente excluído.');
    navigate('/app/clients');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back */}
      <button
        onClick={() => navigate('/app/clients')}
        className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-white/10 overflow-hidden"
        style={{ background: 'linear-gradient(to bottom left, #1a2a4a 0%, #000000 100%)' }}
      >
        <div className="p-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {client.logo || client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold leading-tight">{client.name}</h1>
              <p className="text-white/60 text-sm mt-0.5">{client.industry}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-2 h-2 rounded-full', client.status === 'Ativo' ? 'bg-emerald-400' : 'bg-white/30')} />
                  <span className="text-white/50 text-xs">{client.status}</span>
                </div>
                {client.retainer && (
                  <span className="text-white/30 text-xs">•</span>
                )}
                {client.retainer && (
                  <span className="text-white/50 text-xs">
                    {client.retainer.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
                  </span>
                )}
              </div>
            </div>
          </div>
          {isAdmin && (
            <button onClick={handleDelete} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-surface-container-low border border-surface-container-high rounded-2xl">
        {CLIENT_TABS.map((tab) => (
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
              <ObjectivesSection clientId={client.id} objectives={client.objectives} />
              <RetainerSection client={client} />
              <StrategySection clientId={client.id} strategy={client.strategy} />
              <MarketingDocsSection clientId={client.id} docs={client.marketingDocs} />
            </>
          )}

          {activeTab === 'info' && (
            <>
              <CompanySection
                clientId={client.id}
                description={client.description}
                website={client.website}
                figmaLink={client.figmaLink}
              />
              {canSeeContacts && <ContactsSection clientId={client.id} contacts={client.contacts} />}
              <ContractSection clientId={client.id} contract={client.contract} />
            </>
          )}

          {activeTab === 'brand' && <ClientBrandTab clientId={client.id} />}

          {activeTab === 'tasks' && <ClientKanbanTab clientId={client.id} />}

          {activeTab === 'finances' && (
            <>
              <InvoicesSection clientId={client.id} invoices={client.invoices} />
              {isAdmin && <LegalSection clientId={client.id} legalInfo={client.legalInfo} />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
