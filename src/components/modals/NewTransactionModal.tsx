import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useStore } from '../../store';
import type { Transaction } from '../../store';
import { toast } from 'sonner';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../lib/financeCategories';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction;
}

const EMPTY_FORM = {
  description: '',
  amount: '',
  type: 'in' as 'in' | 'out',
  category: '',
  clientId: '',
  projectId: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'pending' as 'paid' | 'pending' | 'overdue',
  recurring: false,
};

export function NewTransactionModal({ isOpen, onClose, editingTransaction }: NewTransactionModalProps) {
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const clients = useStore((s) => s.clients);
  const projects = useStore((s) => s.projects);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        description: editingTransaction.description,
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        category: editingTransaction.category,
        clientId: editingTransaction.clientId ?? '',
        projectId: editingTransaction.projectId ?? '',
        date: editingTransaction.date,
        status: editingTransaction.status,
        recurring: editingTransaction.recurring ?? false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingTransaction, isOpen]);

  const categories = form.type === 'in' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const filteredProjects = form.clientId
    ? projects.filter((p) => {
        // Projects don't have clientId directly, show all for now
        return true;
      })
    : projects;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category) return;
    setIsSubmitting(true);
    try {
      const payload = {
        description: form.description,
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        clientId: form.clientId || undefined,
        projectId: form.projectId || undefined,
        date: form.date,
        status: form.status,
        recurring: form.recurring || undefined,
        createdAt: editingTransaction?.createdAt ?? new Date().toISOString(),
      };
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
        toast.success('Transação atualizada');
      } else {
        await addTransaction(payload);
        toast.success('Transação criada');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Tipo */}
        <div className="flex gap-2 p-1 bg-surface-variant rounded-xl">
          <button
            type="button"
            onClick={() => { set('type', 'in'); set('category', ''); }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.type === 'in' ? 'bg-green-500/20 text-green-400' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => { set('type', 'out'); set('category', ''); }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.type === 'out' ? 'bg-red-500/20 text-red-400' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Saída
          </button>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Descrição</label>
          <input
            required
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Ex: Fee Mensal — Acme Studio"
            className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
          />
        </div>

        {/* Valor + Categoria */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Valor (R$)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Categoria</label>
            <select
              required
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="">Selecionar...</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cliente + Projeto */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Cliente <span className="text-on-surface-variant font-normal">(opcional)</span></label>
            <select
              value={form.clientId}
              onChange={(e) => set('clientId', e.target.value)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="">Todos</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Projeto <span className="text-on-surface-variant font-normal">(opcional)</span></label>
            <select
              value={form.projectId}
              onChange={(e) => set('projectId', e.target.value)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="">Nenhum</option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Data</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as 'paid' | 'pending' | 'overdue')}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="overdue">Vencido</option>
            </select>
          </div>
        </div>

        {/* Recorrência */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.recurring}
            onChange={(e) => set('recurring', e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
            Recorrência mensal
          </span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : editingTransaction ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
