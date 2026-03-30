import React, { useState } from 'react';
import { SwatchBook, CheckSquare, Package, LogOut, Plus, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { RequestTaskModal } from '../../components/modals/RequestTaskModal';
import { toast } from 'sonner';

type PortalTab = 'brand' | 'tasks' | 'deliverables';

export function ClientPortal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const setSession = useStore((s) => s.setSession);
  const projects = useStore((s) => s.projects);
  const brandhubs = useStore((s) => s.brandhubs);
  const tasks = useStore((s) => s.tasks);
  const clients = useStore((s) => s.clients);

  const feedbacks = useStore((s) => s.feedbacks);
  const addFeedback = useStore((s) => s.addFeedback);

  const [activeTab, setActiveTab] = useState<PortalTab>('tasks');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [pendingRatings, setPendingRatings] = useState<Record<string, number>>({});
  const [pendingComments, setPendingComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const hasFeedback = (taskId: string) => feedbacks.some(f => f.taskId === taskId);

  const handleSubmitFeedback = async (taskId: string) => {
    const rating = pendingRatings[taskId];
    if (!rating) { toast.error('Selecione uma avaliação.'); return; }
    setSubmitting(s => ({ ...s, [taskId]: true }));
    try {
      await addFeedback({
        taskId,
        clientId: session?.activeClientId || '',
        rating,
        comment: pendingComments[taskId] || '',
      });
      toast.success(t('portal.feedback.submitted'));
    } catch {
      toast.error('Erro ao enviar feedback.');
    } finally {
      setSubmitting(s => ({ ...s, [taskId]: false }));
    }
  };

  const client = clients.find((c) => c.id === session?.activeClientId);

  // Find tasks associated with this client
  const clientTasks = tasks.filter(
    (t) => t.clientId === session?.activeClientId && t.status !== 'archived'
  );

  // Calculate active tasks (not done and not archived)
  const activeTasksCount = clientTasks.filter(t => t.status !== 'done').length;
  const maxActiveTasks = client?.maxActiveTasks || 2;
  const canRequestTask = activeTasksCount < maxActiveTasks;

  // Find brandhubs for projects that belong to this client
  const clientBrandHubs = brandhubs.length > 0 ? brandhubs : [];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSession(null);
      navigate('/login');
    }
  };

  const tabs: { id: PortalTab; icon: React.ElementType; label: string }[] = [
    { id: 'tasks', icon: CheckSquare, label: t('portal.requests') },
    { id: 'brand', icon: SwatchBook, label: t('portal.myBrand') },
    { id: 'deliverables', icon: Package, label: t('portal.deliverables') },
  ];

  const statusColors: Record<string, string> = {
    todo: 'bg-surface-container text-on-surface-variant',
    'in-progress': 'bg-blue-500/10 text-blue-400',
    review: 'bg-amber-500/10 text-amber-400',
    done: 'bg-emerald-500/10 text-emerald-400',
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Portal Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-md sticky top-0 z-10 border-b border-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline font-bold">
            DA
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface leading-none">{t('portal.title')}</p>
            {client && (
              <p className="text-xs text-on-surface-variant mt-0.5">{client.name}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2 rounded-xl hover:bg-surface-container-high"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('portal.logout')}</span>
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Client welcome */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-headline font-bold">
            {t('dashboard.greeting', { name: client?.name ?? session.name })}
          </h1>
          <p className="text-on-surface-variant text-sm">{t('portal.title')}</p>
        </motion.div>

        {/* Tab nav */}
        <nav className="flex gap-2 border-b border-surface-container-high pb-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <AnimatePresence mode="wait">
        {activeTab === 'brand' && (
          <motion.div 
            key="brand"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {clientBrandHubs.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant">
                <SwatchBook className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t('portal.noBrandHub')}</p>
              </div>
            ) : (
              clientBrandHubs.map((hub) => {
                const project = projects.find((p) => p.id === hub.projectId);
                return (
                  <div
                    key={hub.id}
                    className="bg-surface-container-low rounded-3xl p-6 border border-surface-container-high space-y-5"
                  >
                    <div>
                      <h3 className="font-semibold text-on-surface">
                        {project?.name ?? 'Brand Hub'}
                      </h3>
                    </div>

                    {/* Colors */}
                    {hub.colors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                          {t('portal.colorPalette')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hub.colors.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-xl">
                              <div
                                className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="text-xs text-on-surface">{c.name || c.hex}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fonts */}
                    {hub.fonts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                          {t('portal.typography')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hub.fonts.map((f, i) => (
                            <span key={i} className="text-xs bg-surface-container px-3 py-1.5 rounded-xl text-on-surface">
                              {f.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Logos */}
                    {hub.logos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                          {t('portal.logos')}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {hub.logos.map((l, i) => (
                            <div key={i} className="w-16 h-16 rounded-2xl bg-surface-container border border-surface-container-high overflow-hidden flex items-center justify-center">
                              <img src={l.url} alt={l.name} className="object-contain w-full h-full p-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Figma link */}
                    {hub.figmaLink && (
                      <a
                        href={hub.figmaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                      >
                        {t('portal.openFigma')}
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'tasks' && (
          <motion.div 
            key="tasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between bg-surface-container-low p-6 rounded-3xl border border-surface-container-high">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-on-surface">{t('portal.requestTitle')}</h2>
                <p className="text-sm text-on-surface-variant">
                  {t('portal.taskSlots', { current: activeTasksCount, max: maxActiveTasks })}
                </p>
                {/* Progress bar */}
                <div className="w-full max-w-xs h-2 bg-surface-container rounded-full mt-3 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      activeTasksCount >= maxActiveTasks ? "bg-red-500" : "bg-primary"
                    )}
                    style={{ width: `${Math.min((activeTasksCount / maxActiveTasks) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                disabled={!canRequestTask}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {t('portal.newRequest')}
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">{t('portal.yourRequests')}</h3>
              {clientTasks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center text-on-surface-variant bg-surface-container-low rounded-3xl border border-surface-container-high"
                >
                  <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t('portal.noRequests')}</p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {clientTasks.map((task) => {
                    const isDone = task.status === 'done';
                    const rated = hasFeedback(task.id);
                    const existingFeedback = feedbacks.find(f => f.taskId === task.id);
                    const hoveredStar = pendingRatings[`hover_${task.id}`] || 0;
                    const selectedStar = pendingRatings[task.id] || 0;
                    const displayStar = hoveredStar || selectedStar;

                    return (
                    <motion.div
                      variants={item}
                      key={task.id}
                      className={cn(
                        "bg-surface-container-low rounded-2xl p-5 border transition-colors",
                        isDone && !rated ? "border-primary/30" : "border-surface-container-high"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-base font-medium text-on-surface">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-on-surface-variant line-clamp-1">{task.description}</p>
                          )}
                          {task.dueDate && (
                            <p className="text-xs text-on-surface-variant mt-1">{t('portal.deadline', { date: task.dueDate })}</p>
                          )}
                        </div>
                        <span className={cn('text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0', statusColors[task.status] ?? statusColors['todo'])}>
                          {task.status === 'todo' && t('portal.status.todo')}
                          {task.status === 'in-progress' && t('portal.status.inProgress')}
                          {task.status === 'review' && t('portal.status.review')}
                          {task.status === 'done' && t('portal.status.done')}
                        </span>
                      </div>

                      {/* Feedback inline — só para tarefas concluídas */}
                      {isDone && (
                        <div className={cn(
                          "mt-4 pt-4 border-t border-surface-container-high",
                        )}>
                          {rated ? (
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={cn('w-4 h-4', s <= (existingFeedback?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-on-surface-variant/20 fill-on-surface-variant/20')} />
                                ))}
                              </div>
                              <span className="text-xs text-emerald-400 font-medium">{t('portal.feedback.alreadyDone')}</span>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm font-medium text-on-surface">{t('portal.feedback.prompt')}</p>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setPendingRatings(r => ({ ...r, [task.id]: s }))}
                                    onMouseEnter={() => setPendingRatings(r => ({ ...r, [`hover_${task.id}`]: s }))}
                                    onMouseLeave={() => setPendingRatings(r => ({ ...r, [`hover_${task.id}`]: 0 }))}
                                    className="p-0.5 transition-transform hover:scale-110"
                                  >
                                    <Star className={cn('w-6 h-6 transition-colors', s <= displayStar ? 'text-yellow-400 fill-yellow-400' : 'text-on-surface-variant/30')} />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={pendingComments[task.id] || ''}
                                onChange={e => setPendingComments(c => ({ ...c, [task.id]: e.target.value }))}
                                placeholder={t('portal.feedback.placeholder')}
                                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 resize-none min-h-[60px]"
                              />
                              <button
                                onClick={() => handleSubmitFeedback(task.id)}
                                disabled={!selectedStar || submitting[task.id]}
                                className="px-4 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
                              >
                                {submitting[task.id] ? '...' : t('portal.feedback.submit')}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );})}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'deliverables' && (
          <motion.div 
            key="deliverables"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="py-16 text-center text-on-surface-variant"
          >
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('portal.deliverablesSoon')}</p>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {session?.activeClientId && (
        <RequestTaskModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          clientId={session.activeClientId}
        />
      )}
    </div>
  );
}
