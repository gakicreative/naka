import React, { useState } from 'react';
import { Star, Users, TrendingUp, Clock, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore, type TeamUser } from '../store';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function StarDisplay({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(value);
        const partial = !filled && i < value;
        return (
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-on-surface-variant/20 fill-on-surface-variant/20 absolute" />
            {(filled || partial) && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: filled ? '100%' : `${(value % 1) * 100}%` }}>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const roleColors: Record<string, string> = {
  admin:  'bg-primary/10 text-primary border-primary/20',
  socio:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  lider:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  seeder: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const roleLabels: Record<string, string> = {
  admin:  'Admin',
  socio:  'Sócio',
  lider:  'Líder',
  seeder: 'Funcionário',
};

// ─── Member Card ─────────────────────────────────────────────────────────────

function MemberCard({ member, indent = false }: { member: TeamUser; indent?: boolean }) {
  const { t } = useTranslation();
  const tasks = useStore((s) => s.tasks);
  const teamUsers = useStore((s) => s.teamUsers);
  const updateTeamUser = useStore((s) => s.updateTeamUser);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);

  const memberTasks = tasks.filter(t => t.assignees?.includes(member.name));
  const active = memberTasks.filter(t => ['todo', 'in-progress', 'review'].includes(t.status));
  const doneThisMonth = memberTasks.filter(
    t => t.status === 'done' && (t.completedAt || t.createdAt || '').startsWith(currentMonth)
  );
  const late = active.filter(t => t.dueDate && t.dueDate < today);
  const total = doneThisMonth.length + active.length;
  const rate = total > 0 ? Math.round((doneThisMonth.length / total) * 100) : 0;

  // Líderes disponíveis para atribuição (somente para seeders)
  const leaders = teamUsers.filter(u => u.role === 'lider');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-surface-container-low rounded-2xl border border-surface-container-high p-5 flex flex-col gap-4",
        indent && "ml-6 border-l-2 border-l-purple-500/30"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-base font-headline font-bold text-primary flex-shrink-0">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-headline font-semibold text-on-surface leading-tight truncate text-sm">{member.name}</h3>
          <p className="text-[11px] text-on-surface-variant truncate">{member.email}</p>
        </div>
        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0', roleColors[member.role] || roleColors.seeder)}>
          {roleLabels[member.role] || member.role}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-container rounded-xl p-2.5 border border-surface-container-high">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">{t('team.activeTasks')}</span>
          </div>
          <p className="text-lg font-headline font-bold text-on-surface">{active.length}</p>
        </div>
        <div className="bg-surface-container rounded-xl p-2.5 border border-surface-container-high">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">{t('team.doneTasks')}</span>
          </div>
          <p className="text-lg font-headline font-bold text-on-surface">{doneThisMonth.length}</p>
        </div>
        <div className="bg-surface-container rounded-xl p-2.5 border border-surface-container-high">
          <div className="flex items-center gap-1 mb-1">
            <AlertCircle className="w-3 h-3 text-error" />
            <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">{t('team.lateTasks')}</span>
          </div>
          <p className={cn('text-lg font-headline font-bold', late.length > 0 ? 'text-error' : 'text-on-surface')}>{late.length}</p>
        </div>
        <div className="bg-surface-container rounded-xl p-2.5 border border-surface-container-high">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">{t('team.completionRate')}</span>
          </div>
          <p className="text-lg font-headline font-bold text-on-surface">{rate}%</p>
        </div>
      </div>

      {/* Seeder: atribuir líder */}
      {member.role === 'seeder' && leaders.length > 0 && (
        <div>
          <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium block mb-1">Líder</label>
          <div className="relative">
            <select
              value={member.leaderId || ''}
              onChange={e => updateTeamUser(member.id, e.target.value || null)}
              className="w-full pl-3 pr-8 py-1.5 bg-surface-container border border-surface-container-high rounded-xl text-sm text-on-surface appearance-none focus:outline-none focus:border-primary/50"
            >
              <option value="">Sem líder</option>
              {leaders.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Team Tab ───────────────────────────────────────────────────────────────

function TeamTab() {
  const { t } = useTranslation();
  const teamUsers = useStore((s) => s.teamUsers);

  const admins  = teamUsers.filter(u => u.role === 'admin');
  const socios  = teamUsers.filter(u => u.role === 'socio');
  const liders  = teamUsers.filter(u => u.role === 'lider');
  const seeders = teamUsers.filter(u => u.role === 'seeder');

  if (teamUsers.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-2xl border border-surface-container-high p-12 flex flex-col items-center gap-3 text-center">
        <Users className="w-12 h-12 text-on-surface-variant opacity-30" />
        <p className="text-sm text-on-surface-variant">{t('team.noMembers')}</p>
      </div>
    );
  }

  const SectionLabel = ({ label, count }: { label: string; count: number }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</span>
      <span className="text-xs text-on-surface-variant/50">({count})</span>
      <div className="flex-1 h-px bg-surface-container-high" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Admins */}
      {admins.length > 0 && (
        <div>
          <SectionLabel label="Administradores" count={admins.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </div>
      )}

      {/* Socios */}
      {socios.length > 0 && (
        <div>
          <SectionLabel label="Sócios" count={socios.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socios.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </div>
      )}

      {/* Líderes + seus seeders */}
      {liders.length > 0 && (
        <div>
          <SectionLabel label="Líderes & Equipes" count={liders.length} />
          <div className="space-y-6">
            {liders.map(lider => {
              const grupo = seeders.filter(s => s.leaderId === lider.id);
              return (
                <div key={lider.id} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MemberCard member={lider} />
                  </div>
                  {grupo.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grupo.map(s => <MemberCard key={s.id} member={s} indent />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seeders sem líder */}
      {seeders.filter(s => !s.leaderId).length > 0 && (
        <div>
          <SectionLabel label="Funcionários (sem líder)" count={seeders.filter(s => !s.leaderId).length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seeders.filter(s => !s.leaderId).map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Health Tab (read-only — feedbacks enviados pelos clientes) ──────────────

function HealthTab() {
  const { t } = useTranslation();
  const clients = useStore((s) => s.clients);
  const feedbacks = useStore((s) => s.feedbacks);

  const months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  }).reverse();

  const currentMonth = months[months.length - 1];

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(new Date(+y, +mo - 1));
  };

  const avgForMonth = (clientId: string, month: string) => {
    const entries = feedbacks.filter(f => f.clientId === clientId && f.createdAt.startsWith(month));
    if (!entries.length) return null;
    return entries.reduce((sum, f) => sum + f.rating, 0) / entries.length;
  };

  const totalFeedbacks = (clientId: string) => feedbacks.filter(f => f.clientId === clientId).length;

  const activeClients = clients.filter(c => c.status === 'Ativo');

  if (activeClients.length === 0) {
    return <p className="text-sm text-on-surface-variant text-center py-12">Nenhum cliente ativo.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeClients.map((client) => {
        const currentAvg = avgForMonth(client.id, currentMonth);
        const total = totalFeedbacks(client.id);

        return (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-low rounded-2xl border border-surface-container-high p-5 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-lg font-headline font-bold text-on-primary flex-shrink-0">
                {client.logo}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-headline font-semibold text-on-surface leading-tight truncate">{client.name}</h3>
                <p className="text-xs text-on-surface-variant">{client.industry}</p>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-3 border border-surface-container-high">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium block mb-2">{t('team.avgRating')}</span>
              {currentAvg !== null ? (
                <div className="flex items-center gap-2">
                  <StarDisplay value={currentAvg} />
                  <span className="text-lg font-headline font-bold text-on-surface">{currentAvg.toFixed(1)}</span>
                  <span className="text-xs text-on-surface-variant">/5</span>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic">{t('team.noFeedbacks')}</p>
              )}
              <p className="text-[11px] text-on-surface-variant/60 mt-1">{total} avaliação(ões) no total</p>
            </div>

            {/* Histórico 3 meses */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium block mb-2">{t('team.history')}</span>
              <div className="flex items-end gap-2 h-12">
                {months.map((m) => {
                  const avg = avgForMonth(client.id, m);
                  const height = avg !== null ? Math.max((avg / 5) * 100, 8) : 8;
                  const isCurrent = m === currentMonth;
                  return (
                    <div key={`${client.id}-${m}`} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center h-9">
                        <div
                          className={cn('w-full rounded-t-md transition-all', avg !== null ? isCurrent ? 'bg-primary' : 'bg-primary/40' : 'bg-surface-container')}
                          style={{ height: `${height}%` }}
                          title={avg !== null ? `${avg.toFixed(1)} ★` : 'Sem dados'}
                        />
                      </div>
                      <span className="text-[9px] text-on-surface-variant truncate w-full text-center">{monthLabel(m)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export function Team() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'team' | 'health'>('team');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <header>
        <h1 className="text-3xl font-headline font-bold text-on-surface">{t('team.title')}</h1>
      </header>

      <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl border border-surface-container-high w-fit">
        {(['team', 'health'] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all',
              tab === id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {id === 'team' ? t('team.tabTeam') : t('team.tabHealth')}
          </button>
        ))}
      </div>

      {tab === 'team' ? <TeamTab /> : <HealthTab />}
    </div>
  );
}
