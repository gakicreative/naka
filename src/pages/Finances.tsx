import React, { useState, useMemo } from 'react';
import {
  Plus, TrendingUp, TrendingDown, DollarSign, Clock,
  Pencil, Trash2, RefreshCw, ChevronDown, FileText,
} from 'lucide-react';
import { useStore } from '../store';
import type { Transaction } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NewTransactionModal } from '../components/modals/NewTransactionModal';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const STATUS_LABELS: Record<Transaction['status'], string> = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Vencido',
};
const STATUS_COLORS: Record<Transaction['status'], string> = {
  paid: 'bg-green-500/10 text-green-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
  overdue: 'bg-red-500/10 text-red-500',
};

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getLast6Months() {
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTHS_PT[d.getMonth()] });
  }
  return result;
}

function getMonthOptions() {
  const now = new Date();
  const opts: { label: string; value: string }[] = [{ label: 'Todos os meses', value: '' }];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
    opts.push({ label, value });
  }
  return opts;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container border border-surface-container-high rounded-xl p-3 text-sm shadow-lg">
      <p className="font-semibold text-on-surface mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
};

export function Finances() {
  const transactions = useStore((s) => s.transactions);
  const clients = useStore((s) => s.clients);
  const updateClient = useStore((s) => s.updateClient);
  const deleteTransaction = useStore((s) => s.deleteTransaction);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [filterMonth, setFilterMonth] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [filterClientId, setFilterClientId] = useState('');

  const monthOptions = useMemo(() => getMonthOptions(), []);
  const last6Months = useMemo(() => getLast6Months(), []);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterMonth && !tx.date.startsWith(filterMonth)) return false;
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
      if (filterClientId && tx.clientId !== filterClientId) return false;
      return true;
    });
  }, [transactions, filterMonth, filterType, filterStatus, filterClientId]);

  // Summary — always over ALL transactions (no month filter for cards)
  const income = transactions.filter((tx) => tx.type === 'in').reduce((s, tx) => s + tx.amount, 0);
  const expenses = transactions.filter((tx) => tx.type === 'out').reduce((s, tx) => s + tx.amount, 0);
  const balance = income - expenses;
  const receivable = transactions.filter((tx) => tx.type === 'in' && tx.status !== 'paid').reduce((s, tx) => s + tx.amount, 0);

  // Chart data — last 6 months
  const chartData = useMemo(() => {
    return last6Months.map(({ year, month, label }) => {
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthTxs = transactions.filter((tx) => tx.date.startsWith(monthStr));
      return {
        name: label,
        Receitas: monthTxs.filter((tx) => tx.type === 'in').reduce((s, tx) => s + tx.amount, 0),
        Despesas: monthTxs.filter((tx) => tx.type === 'out').reduce((s, tx) => s + tx.amount, 0),
      };
    });
  }, [transactions, last6Months]);

  // Faturamento por cliente
  const clientRevenue = useMemo(() => {
    const map: Record<string, { paid: number; total: number; pending: number; overdue: number }> = {};
    transactions.filter((tx) => tx.type === 'in' && tx.clientId).forEach((tx) => {
      if (!map[tx.clientId!]) map[tx.clientId!] = { paid: 0, total: 0, pending: 0, overdue: 0 };
      map[tx.clientId!].total += tx.amount;
      if (tx.status === 'paid') map[tx.clientId!].paid += tx.amount;
      if (tx.status === 'pending') map[tx.clientId!].pending += tx.amount;
      if (tx.status === 'overdue') map[tx.clientId!].overdue += tx.amount;
    });
    return Object.entries(map)
      .map(([clientId, data]) => ({ clientId, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  // Contas a receber (invoices dos clientes)
  const pendingInvoices = useMemo(() => {
    const result: { clientId: string; clientName: string; invoiceId: string; number: string; amount: number; dueDate: string; status: 'pending' | 'overdue' }[] = [];
    clients.forEach((c) => {
      c.invoices?.forEach((inv) => {
        if (inv.status === 'pending' || inv.status === 'overdue') {
          result.push({ clientId: c.id, clientName: c.name, invoiceId: inv.id, number: inv.number, amount: inv.amount, dueDate: inv.dueDate, status: inv.status });
        }
      });
    });
    return result.sort((a, b) => (a.status === 'overdue' ? -1 : 1) || a.dueDate.localeCompare(b.dueDate));
  }, [clients]);

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    await deleteTransaction(id);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const markInvoicePaid = (clientId: string, invoiceId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const invoices = client.invoices?.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: 'paid' as const, paidDate: new Date().toISOString().slice(0, 10) } : inv
    );
    updateClient(clientId, { invoices });
  };

  const activeFilters = [filterMonth, filterType !== 'all', filterStatus !== 'all', filterClientId].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Finanças</h1>
          <p className="text-on-surface-variant mt-1 text-sm">{transactions.length} transações registradas</p>
        </div>
        <button
          onClick={() => { setEditingTx(undefined); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Nova Transação
        </button>
      </div>

      {/* Summary Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item} className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Receitas</p>
            <p className="text-xl font-bold text-on-surface">{fmt(income)}</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Despesas</p>
            <p className="text-xl font-bold text-on-surface">{fmt(expenses)}</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Saldo</p>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-on-surface' : 'text-red-500'}`}>{fmt(balance)}</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">A Receber</p>
            <p className="text-xl font-bold text-yellow-500">{fmt(receivable)}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Chart */}
      <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-on-surface mb-4">Fluxo dos últimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Month */}
        <div className="relative">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-surface-container-low border border-surface-container-high rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-primary"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        </div>

        {/* Type chips */}
        <div className="flex items-center gap-1 bg-surface-container-low border border-surface-container-high rounded-xl p-1">
          {(['all', 'in', 'out'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterType === t ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {t === 'all' ? 'Todos' : t === 'in' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-1 bg-surface-container-low border border-surface-container-high rounded-xl p-1">
          {(['all', 'paid', 'pending', 'overdue'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Client filter */}
        <div className="relative">
          <select
            value={filterClientId}
            onChange={(e) => setFilterClientId(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-surface-container-low border border-surface-container-high rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        </div>

        {activeFilters > 0 && (
          <button
            onClick={() => { setFilterMonth(''); setFilterType('all'); setFilterStatus('all'); setFilterClientId(''); }}
            className="text-xs text-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}

        <span className="ml-auto text-xs text-on-surface-variant">
          {filtered.length} de {transactions.length} transações
        </span>
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
          <DollarSign className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhuma transação encontrada.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="bg-surface-container-low border border-surface-container-high rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-container-high">
                  <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Descrição</th>
                  <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Valor</th>
                  <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Categoria</th>
                  <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Cliente</th>
                  <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Data</th>
                  <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((tx) => {
                    const clientName = tx.clientId ? clients.find((c) => c.id === tx.clientId)?.name : null;
                    const isDeleting = deletingId === tx.id;
                    return (
                      <motion.tr
                        key={tx.id}
                        variants={item}
                        layout
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-surface-container-high last:border-0 hover:bg-surface-container transition-colors"
                      >
                        <td className="px-5 py-3 text-on-surface">
                          <div className="flex items-center gap-2">
                            {tx.recurring && (
                              <RefreshCw className="w-3 h-3 text-primary flex-shrink-0" title="Recorrente" />
                            )}
                            {tx.description}
                          </div>
                        </td>
                        <td className={`px-5 py-3 font-medium ${tx.type === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.type === 'in' ? '+' : '-'}{fmt(tx.amount)}
                        </td>
                        <td className="px-5 py-3 text-on-surface-variant">{tx.category}</td>
                        <td className="px-5 py-3 text-on-surface-variant">{clientName ?? <span className="opacity-30">—</span>}</td>
                        <td className="px-5 py-3 text-on-surface-variant">
                          {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[tx.status]}`}>
                            {STATUS_LABELS[tx.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {isDeleting ? (
                            <div className="flex items-center gap-2 text-xs">
                              <button onClick={() => handleDelete(tx.id)} className="text-red-500 hover:underline font-medium">Confirmar</button>
                              <button onClick={() => setDeletingId(null)} className="text-on-surface-variant hover:underline">Cancelar</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
                              <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDeletingId(tx.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Nível 3: Faturamento por Cliente ── */}
      {clientRevenue.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-headline font-semibold text-on-surface">Faturamento por Cliente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientRevenue.map(({ clientId, total, paid, pending, overdue }) => {
              const client = clients.find((c) => c.id === clientId);
              if (!client) return null;
              const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
              const hasPending = pending > 0 || overdue > 0;
              return (
                <motion.div
                  key={clientId}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface text-sm truncate">{client.name}</p>
                      <p className="text-xs text-on-surface-variant">Total: {fmt(total)}</p>
                    </div>
                    {hasPending && (
                      <span className="ml-auto text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md font-medium flex-shrink-0">
                        Pendente
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Recebido: {fmt(paid)}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {overdue > 0 && (
                    <p className="text-xs text-red-500 font-medium">Vencido: {fmt(overdue)}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Nível 3: Contas a Receber ── */}
      {pendingInvoices.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-headline font-semibold text-on-surface">Contas a Receber</h2>
          <div className="bg-surface-container-low border border-surface-container-high rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-container-high">
                    <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Cliente</th>
                    <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Fatura</th>
                    <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Valor</th>
                    <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Vencimento</th>
                    <th className="text-left px-5 py-3 text-on-surface-variant font-medium">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {pendingInvoices.map((inv) => (
                    <tr key={inv.invoiceId} className="border-b border-surface-container-high last:border-0 hover:bg-surface-container transition-colors">
                      <td className="px-5 py-3 text-on-surface font-medium">{inv.clientName}</td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          #{inv.number}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-on-surface">{fmt(inv.amount)}</td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {new Date(inv.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                          {STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => markInvoicePaid(inv.clientId, inv.invoiceId)}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Marcar como pago
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTx(undefined); }}
        editingTransaction={editingTx}
      />
    </div>
  );
}
