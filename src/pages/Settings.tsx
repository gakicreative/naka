import React, { useState, useEffect, useRef } from 'react';
import { User, Palette, Shield, Key, Bell, Globe, Monitor, Moon, Sun, Users, Plus, Copy, Check, Trash2, Building2, Upload, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../components/AppProvider';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { OrgLogo } from '../components/OrgLogo';
type Tab = 'profile' | 'visual' | 'permissions' | 'security' | 'notifications' | 'localization' | 'team' | 'organization';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { userName, setUserName } = useApp();
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const session = useStore((s) => s.session);

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [displayName, setDisplayName] = useState(userName);
  // Invites state
  const [invites, setInvites] = useState<any[]>([]);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const tabs: { id: Tab; icon: React.ElementType; label: string; adminOnly?: boolean; adminOrSocio?: boolean }[] = [
    { id: 'profile',       icon: User,       label: t('settings.tabs.profile') },
    { id: 'visual',        icon: Palette,    label: t('settings.tabs.visual') },
    { id: 'organization',  icon: Building2,  label: 'Organização', adminOrSocio: true },
    { id: 'team',          icon: Users,      label: 'Equipe', adminOnly: true },
    { id: 'permissions',   icon: Shield,     label: t('settings.tabs.permissions') },
    { id: 'security',      icon: Key,        label: t('settings.tabs.security') },
    { id: 'notifications', icon: Bell,       label: t('settings.tabs.notifications') },
    { id: 'localization',  icon: Globe,      label: t('settings.tabs.localization') },
  ];

  const visibleTabs = tabs.filter(tab => {
    if (tab.adminOnly) return session?.role === 'admin';
    if (tab.adminOrSocio) return session?.role === 'admin' || session?.role === 'socio';
    return true;
  });

  useEffect(() => {
    if (activeTab === 'team' && session?.role === 'admin') {
      fetchInvites();
    }
  }, [activeTab, session]);

  const fetchInvites = async () => {
    try {
      const res = await fetch('/api/invitations', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch invites');
      setInvites(await res.json());
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Erro ao carregar convites.');
    }
  };

  const handleGenerateInvite = async (role: 'socio' | 'lider' | 'seeder') => {
    setIsGeneratingInvite(true);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to generate invite');
      toast.success(`Convite para ${role} gerado com sucesso!`);
      fetchInvites();
    } catch (error) {
      console.error('Error generating invite:', error);
      toast.error('Erro ao gerar convite.');
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

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/invitations/${inviteId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      toast.success('Convite cancelado.');
      fetchInvites();
    } catch {
      toast.error('Erro ao cancelar convite.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName }),
        credentials: 'include',
      });
      setUserName(displayName);
      toast.success(t('settings.profile.saveSuccess'));
    } catch {
      toast.error('Erro ao salvar perfil.');
    }
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
          {activeTab === 'organization' && (
            <OrgLogoSection />
          )}
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
                  <h2 className="font-headline font-semibold text-xl">{t('settings.tabs.team')}</h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Gere convites para adicionar sócios ou seeders à plataforma.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleGenerateInvite('socio')}
                    disabled={isGeneratingInvite}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {t('settings.team.newPartner')}
                  </button>
                  <button
                    onClick={() => handleGenerateInvite('lider')}
                    disabled={isGeneratingInvite}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    + Líder
                  </button>
                  <button
                    onClick={() => handleGenerateInvite('seeder')}
                    disabled={isGeneratingInvite}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-variant text-on-surface text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {t('settings.team.newSeeder')}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-on-surface">{t('settings.team.invitesGenerated')}</h3>
                {invites.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant border border-dashed border-surface-container-high rounded-2xl">
                    <p className="text-sm">{t('settings.team.noInvites')}</p>
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
                              {t('settings.team.used')}
                            </span>
                          ) : (
                            <>
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                {t('settings.team.pending')}
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
                              <button
                                onClick={() => handleCancelInvite(invite.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 transition-colors"
                                title="Cancelar convite"
                              >
                                <Trash2 className="w-4 h-4" />
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
                  <h3 className="text-lg font-medium text-red-500 mb-2">{t('settings.danger.title')}</h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    {t('settings.danger.clearCacheDesc')}
                  </p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('nakaos-store');
                      toast.success(t('settings.danger.clearCacheSuccess'));
                      setTimeout(() => window.location.reload(), 1500);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                  >
                    {t('settings.danger.clearCache')}
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

// ── OrgLogoSection ────────────────────────────────────────────────────────────
function OrgLogoSection() {
  const storeSession = useStore(s => s.session);
  const storeSetSession = useStore(s => s.setSession);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  const MAX_BYTES = 5 * 1024 * 1024;

  function validate(file: File): string | null {
    if (!ALLOWED.includes(file.type)) return 'Formato não suportado. Use JPEG, PNG, WebP ou SVG.';
    if (file.size > MAX_BYTES) return 'Arquivo maior que 5 MB.';
    return null;
  }

  async function handleUpload(file: File) {
    const err = validate(file);
    if (err) { toast.error(err); return; }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
      if (!upRes.ok) throw new Error('Upload failed');
      const { url } = await upRes.json() as { url: string };

      const patchRes = await fetch('/api/orgs/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ logoUrl: url }),
      });
      if (!patchRes.ok) throw new Error('Save failed');

      storeSetSession(storeSession ? { ...storeSession, orgLogoUrl: url } : storeSession);
      toast.success('Logo atualizada com sucesso!');
    } catch {
      toast.error('Falha ao enviar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleRemove() {
    setIsRemoving(true);
    try {
      const res = await fetch('/api/orgs/me/logo', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      storeSetSession(storeSession ? { ...storeSession, orgLogoUrl: null } : storeSession);
      toast.success('Logo removida.');
    } catch {
      toast.error('Falha ao remover logo.');
    } finally {
      setIsRemoving(false);
      setShowConfirm(false);
    }
  }

  return (
    <motion.section
      key="organization"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-surface-container-high space-y-6"
    >
      <div>
        <h2 className="font-headline font-semibold text-xl">Logo da Organização</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Substitui a identidade visual do Naka OS no painel e no portal do cliente.
        </p>
      </div>

      {storeSession?.orgLogoUrl ? (
        <div className="flex items-center gap-6 flex-wrap">
          <div className="w-24 h-24 rounded-2xl bg-surface-container border border-surface-container-high flex items-center justify-center p-3">
            <OrgLogo logoUrl={storeSession.orgLogoUrl} orgName={storeSession.orgName ?? ''} size="lg" />
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Enviando…' : 'Substituir logo'}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isRemoving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-error/30 text-error text-sm font-medium hover:bg-error/10 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Remover logo
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-surface-container-high rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
        >
          <Upload className="w-8 h-8 text-on-surface-variant/40" />
          <p className="text-sm font-medium text-on-surface">
            {isUploading ? 'Enviando…' : 'Clique para fazer upload da logo'}
          </p>
          <p className="text-xs text-on-surface-variant">JPEG, PNG, WebP, SVG — máx. 5 MB</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
      />

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-semibold text-on-surface">Remover logo?</h3>
            <p className="text-sm text-on-surface-variant">A logo será removida e o sistema voltará a exibir as iniciais da organização.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container transition-colors">Cancelar</button>
              <button onClick={handleRemove} disabled={isRemoving} className="px-4 py-2 rounded-xl bg-error text-white text-sm font-medium hover:bg-error/90 transition-colors disabled:opacity-50">
                {isRemoving ? 'Removendo…' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
