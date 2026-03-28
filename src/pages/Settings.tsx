import React, { useState, useEffect } from 'react';
import { User, Palette, Shield, Key, Bell, Globe, Tag, Monitor, Moon, Sun, Users, Plus, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../components/AppProvider';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { LabelTag } from '../components/LabelTag';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ManageLabelsModal } from '../components/modals/ManageLabelsModal';

type Tab = 'profile' | 'visual' | 'permissions' | 'security' | 'notifications' | 'localization' | 'labels' | 'team';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { userName, setUserName } = useApp();
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const session = useStore((s) => s.session);

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [displayName, setDisplayName] = useState(userName);
  const [isLabelsModalOpen, setLabelsModalOpen] = useState(false);
  const labels = useStore((s) => s.labels);

  // Invites state
  const [invites, setInvites] = useState<any[]>([]);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const tabs: { id: Tab; icon: React.ElementType; label: string; adminOnly?: boolean }[] = [
    { id: 'profile',       icon: User,    label: t('settings.tabs.profile') },
    { id: 'visual',        icon: Palette, label: t('settings.tabs.visual') },
    { id: 'team',          icon: Users,   label: 'Equipe', adminOnly: true },
    { id: 'permissions',   icon: Shield,  label: t('settings.tabs.permissions') },
    { id: 'security',      icon: Key,     label: t('settings.tabs.security') },
    { id: 'notifications', icon: Bell,    label: t('settings.tabs.notifications') },
    { id: 'localization',  icon: Globe,   label: t('settings.tabs.localization') },
    { id: 'labels',        icon: Tag,     label: 'Etiquetas' },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || session?.role === 'admin');

  useEffect(() => {
    if (activeTab === 'team' && session?.role === 'admin') {
      fetchInvites();
    }
  }, [activeTab, session]);

  const fetchInvites = async () => {
    try {
      const q = query(collection(db, 'invitations'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedInvites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvites(fetchedInvites);
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error("Erro ao carregar convites.");
    }
  };

  const handleGenerateInvite = async (role: 'socio' | 'seeder') => {
    if (!auth.currentUser) return;
    setIsGeneratingInvite(true);
    try {
      await addDoc(collection(db, 'invitations'), {
        role,
        used: false,
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      toast.success(`Convite para ${role} gerado com sucesso!`);
      fetchInvites();
    } catch (error) {
      console.error("Error generating invite:", error);
      toast.error("Erro ao gerar convite.");
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const copyInviteLink = (inviteId: string) => {
    const url = `${window.location.origin}/login?invite=${inviteId}`;
    navigator.clipboard.writeText(url);
    setCopiedInviteId(inviteId);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(displayName);
    toast.success(t('settings.profile.saveSuccess'));
  };

  const handleLanguageChange = (lang: 'pt-BR' | 'en-US') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    toast.success(t('settings.localization.changed'));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-on-surface">
          {t('settings.title')}
        </h1>
        <p className="text-on-surface-variant text-sm md:text-base">
          {t('settings.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <nav className="space-y-2 md:col-span-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                activeTab === tab.id
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
          {activeTab === 'team' && session?.role === 'admin' && (
            <motion.section
              key="team"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-surface-container-high"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-headline font-semibold text-xl">Equipe e Convites</h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Gere convites para adicionar sócios ou seeders à plataforma.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateInvite('socio')}
                    disabled={isGeneratingInvite}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Sócio
                  </button>
                  <button
                    onClick={() => handleGenerateInvite('seeder')}
                    disabled={isGeneratingInvite}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-variant text-on-surface text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Seeder
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-on-surface">Convites Gerados</h3>
                {invites.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant border border-dashed border-surface-container-high rounded-2xl">
                    <p className="text-sm">Nenhum convite gerado ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-container border border-surface-container-high">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              invite.role === 'socio' ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                            )}>
                              {invite.role.toUpperCase()}
                            </span>
                            <span className="text-sm text-on-surface-variant">
                              {new Date(invite.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-mono mt-1 text-on-surface">
                            {invite.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {invite.used ? (
                            <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">
                              Usado
                            </span>
                          ) : (
                            <>
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                Pendente
                              </span>
                              <button
                                onClick={() => copyInviteLink(invite.id)}
                                className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-colors"
                                title="Copiar link de convite"
                              >
                                {copiedInviteId === invite.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {activeTab === 'profile' && (
            <motion.section
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-surface-container-high"
            >
              <h2 className="font-headline font-semibold text-xl mb-6">{t('settings.profile.title')}</h2>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-surface-container-low bg-surface-container-highest flex items-center justify-center text-3xl text-on-surface font-bold">
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-on-surface">{t('settings.profile.avatar')}</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm">
                    {t('settings.profile.avatarHint')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">
                    {t('settings.profile.nameLabel')}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
                    placeholder="Ex: Gaki Creative"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">
                    {t('settings.profile.roleLabel')}
                  </label>
                  <input
                    type="text"
                    defaultValue="Admin"
                    className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-medium transition-colors shadow-sm shadow-primary/20"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </form>
            </motion.section>
          )}

          {activeTab === 'visual' && (
            <motion.section
              key="visual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-surface-container-high"
            >
              <h2 className="font-headline font-semibold text-xl mb-6">{t('settings.visual.title')}</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'system', icon: Monitor, labelKey: 'settings.visual.system' },
                  { id: 'dark', icon: Moon,    labelKey: 'settings.visual.dark' },
                  { id: 'light', icon: Sun,     labelKey: 'settings.visual.light' },
                ].map((tOption) => (
                  <button
                    key={tOption.id}
                    onClick={() => setTheme(tOption.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-colors",
                      theme === tOption.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-surface-container-high bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    <tOption.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{t(tOption.labelKey)}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant mt-4 text-center">
                {t('settings.visual.hint')}
              </p>
            </motion.section>
          )}

          {activeTab === 'localization' && (
            <motion.section
              key="localization"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-surface-container-high"
            >
              <h2 className="font-headline font-semibold text-xl mb-2">{t('settings.localization.title')}</h2>
              <p className="text-sm text-on-surface-variant mb-6">{t('settings.localization.subtitle')}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PT-BR */}
                <button
                  onClick={() => handleLanguageChange('pt-BR')}
                  className={cn(
                    'flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left',
                    language === 'pt-BR'
                      ? 'border-primary bg-primary/10'
                      : 'border-surface-container-high bg-surface-container hover:border-primary/40'
                  )}
                >
                  <span className="text-3xl">🇧🇷</span>
                  <div>
                    <p className={cn('font-semibold text-sm', language === 'pt-BR' ? 'text-primary' : 'text-on-surface')}>
                      {t('settings.localization.portuguese')}
                    </p>
                    {language === 'pt-BR' && (
                      <p className="text-xs text-primary/70 mt-0.5">Ativo</p>
                    )}
                  </div>
                </button>

                {/* EN-US */}
                <button
                  onClick={() => handleLanguageChange('en-US')}
                  className={cn(
                    'flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left',
                    language === 'en-US'
                      ? 'border-primary bg-primary/10'
                      : 'border-surface-container-high bg-surface-container hover:border-primary/40'
                  )}
                >
                  <span className="text-3xl">🇺🇸</span>
                  <div>
                    <p className={cn('font-semibold text-sm', language === 'en-US' ? 'text-primary' : 'text-on-surface')}>
                      {t('settings.localization.english')}
                    </p>
                    {language === 'en-US' && (
                      <p className="text-xs text-primary/70 mt-0.5">Active</p>
                    )}
                  </div>
                </button>
              </div>
            </motion.section>
          )}

          {(activeTab === 'permissions' || activeTab === 'notifications') && (
            <motion.section
              key="unavailable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-surface-container-high"
            >
              <h2 className="font-headline font-semibold text-xl mb-4">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <div className="py-12 text-center text-on-surface-variant">
                <p className="text-sm">{t('settings.unavailable')}</p>
              </div>
            </motion.section>
          )}

          {activeTab === 'security' && (
            <motion.section
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-surface-container-high"
            >
              <h2 className="font-headline font-semibold text-xl mb-4">
                {t('settings.tabs.security')}
              </h2>
              
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
                  <h3 className="text-lg font-medium text-red-500 mb-2">Zona de Perigo</h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Limpar o cache local apagará suas preferências de idioma e estado de notificações lidas. Os dados do aplicativo (clientes, projetos) agora estão salvos com segurança na nuvem.
                  </p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('nakaos-store');
                      toast.success('Cache local apagado com sucesso! Recarregando...');
                      setTimeout(() => window.location.reload(), 1500);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                  >
                    Limpar Cache Local
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === 'labels' && (
            <motion.section
              key="labels"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-surface-container-high"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-headline font-semibold text-xl">Etiquetas</h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Crie etiquetas personalizadas para classificar as tarefas do Kanban.
                  </p>
                </div>
                <button
                  onClick={() => setLabelsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-sm font-medium text-on-surface transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  Gerenciar
                </button>
              </div>

              {labels.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {labels.map((label) => (
                    <LabelTag key={label.id} label={label} size="md" />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-on-surface-variant">
                  <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhuma etiqueta criada ainda.</p>
                  <button
                    onClick={() => setLabelsModalOpen(true)}
                    className="mt-3 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-sm font-medium text-on-surface transition-colors"
                  >
                    Criar primeira etiqueta
                  </button>
                </div>
              )}
            </motion.section>
          )}
          </AnimatePresence>
        </div>
      </div>

      <ManageLabelsModal
        isOpen={isLabelsModalOpen}
        onClose={() => setLabelsModalOpen(false)}
      />
    </div>
  );
}
