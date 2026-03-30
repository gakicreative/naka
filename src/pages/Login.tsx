import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useApp } from '../components/AppProvider';
import {
  Eye, EyeOff, LogIn, CheckCircle, XCircle, Loader2,
  ArrowRight, KeyRound, Ticket,
} from 'lucide-react';

// ─── Google SVG ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const OAUTH_ERRORS: Record<string, string> = {
  invite_required: 'É necessário um convite válido para criar uma conta. Cole seu código abaixo e tente novamente.',
  invite_invalid:  'O convite utilizado é inválido ou já foi usado. Verifique o código e tente novamente.',
  oauth_failed:    'Falha na autenticação com Google. Tente novamente.',
};

const ROLE_LABELS: Record<string, string> = {
  admin:   'Administrador',
  socio:   'Sócio',
  lider:   'Líder',
  seeder:  'Funcionário',
  cliente: 'Cliente',
};

type InviteStatus = 'idle' | 'checking' | 'valid' | 'invalid';
type ActiveTab = 'google' | 'email';

const SESSION_INVITE_KEY = 'naka_pending_invite';

// ─── Componente ───────────────────────────────────────────────────────────────
export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session    = useStore((s) => s.session);
  const setSession = useStore((s) => s.setSession);
  const { isAuthReady, setUserName } = useApp();

  // Aba ativa (google | email)
  const [activeTab, setActiveTab] = useState<ActiveTab>('google');

  // Campos de login email/senha
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  // Convite
  const [inviteCode, setInviteCode]     = useState('');
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>('idle');
  const [inviteRole, setInviteRole]     = useState('');
  const inviteInputRef = useRef<HTMLInputElement>(null);

  // Erro OAuth vindo da URL (?error=invite_required…)
  const oauthError = searchParams.get('error');

  // ── 1. Restaura convite do sessionStorage após redirect OAuth ─────────────
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_INVITE_KEY);
    if (saved) {
      setInviteCode(saved);
    }
  }, []);

  // ── 2. Preenche convite se vier pela URL (?invite=xxx) ────────────────────
  useEffect(() => {
    const codeFromUrl = searchParams.get('invite');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
    }
  }, [searchParams]);

  // ── 3. Quando há erro invite_required, foca o campo e muda aba ────────────
  useEffect(() => {
    if (oauthError === 'invite_required' || oauthError === 'invite_invalid') {
      setActiveTab('google'); // garante aba google
      setTimeout(() => inviteInputRef.current?.focus(), 100);
    }
  }, [oauthError]);

  // ── 4. Valida convite com debounce ────────────────────────────────────────
  const validateInvite = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) { setInviteStatus('idle'); setInviteRole(''); return; }
    setInviteStatus('checking');
    try {
      const res  = await fetch(`/api/invitations/check/${trimmed}`);
      const data = await res.json() as { valid?: boolean; role?: string; error?: string };
      if (res.ok && data.valid) {
        setInviteStatus('valid');
        setInviteRole(data.role || '');
      } else {
        setInviteStatus('invalid');
        setInviteRole('');
      }
    } catch {
      setInviteStatus('invalid');
      setInviteRole('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { validateInvite(inviteCode); }, 400);
    return () => clearTimeout(timer);
  }, [inviteCode, validateInvite]);

  // ── 5. Sincroniza sessionStorage com o código digitado ───────────────────
  useEffect(() => {
    if (inviteCode.trim()) {
      sessionStorage.setItem(SESSION_INVITE_KEY, inviteCode.trim());
    } else {
      sessionStorage.removeItem(SESSION_INVITE_KEY);
    }
  }, [inviteCode]);

  // ── 6. Redireciona se já autenticado ─────────────────────────────────────
  useEffect(() => {
    if (isAuthReady && session) {
      sessionStorage.removeItem(SESSION_INVITE_KEY);
      navigate(session.role === 'cliente' ? '/portal' : '/');
    }
  }, [isAuthReady, session, navigate]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Monta URL do Google ───────────────────────────────────────────────────
  const googleHref = (inviteCode.trim() && inviteStatus === 'valid')
    ? `/api/auth/google?invite=${encodeURIComponent(inviteCode.trim())}`
    : '/api/auth/google';

  // ── Handler login email ───────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error || t('login.error'));
        return;
      }
      const data = await res.json();
      const user = data.user ?? data;
      setSession({ role: user.role, name: user.name, email: user.email, activeClientId: user.activeClientId });
      setUserName(user.name);
      toast.success(t('login.success'));
    } catch {
      toast.error(t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const hasInviteError = oauthError === 'invite_required' || oauthError === 'invite_invalid';
  const needsInvite    = inviteStatus !== 'valid';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">

        {/* Logo + Título */}
        <div className="text-center space-y-4">
          <img src="/naka-logo.svg" alt="Naka" className="h-12 w-auto mx-auto" />
          <p className="text-on-surface-variant text-sm">{t('login.subtitle')}</p>
        </div>

        <div className="bg-surface-container-low rounded-3xl border border-surface-container-high shadow-xl overflow-hidden">

          {/* ── Abas ─────────────────────────────────────────────────────── */}
          <div className="flex border-b border-surface-container-high">
            <button
              type="button"
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                activeTab === 'google'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Entrar com Google
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                activeTab === 'email'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Email e Senha
            </button>
          </div>

          <div className="p-8 space-y-5">

            {/* ── Erro OAuth ─────────────────────────────────────────── */}
            {oauthError && (
              <div className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2.5 ${
                hasInviteError
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-error/10 border border-error/20 text-error'
              }`}>
                {hasInviteError
                  ? <Ticket className="w-4 h-4 mt-0.5 shrink-0" />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                }
                <span>{OAUTH_ERRORS[oauthError] || 'Erro ao autenticar com Google.'}</span>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* ABA GOOGLE                                               */}
            {/* ════════════════════════════════════════════════════════ */}
            {activeTab === 'google' && (
              <div className="space-y-5">

                {/* Campo de convite */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    Código de Convite
                    <span className="text-on-surface-variant/50 font-normal ml-1">(obrigatório para novos usuários)</span>
                  </label>

                  <div className="relative">
                    <input
                      ref={inviteInputRef}
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Cole aqui o código de convite recebido"
                      spellCheck={false}
                      autoComplete="off"
                      className={`w-full bg-surface-container border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none transition-all text-on-surface font-mono placeholder:font-sans placeholder:text-sm
                        ${inviteStatus === 'valid'   ? 'border-green-500/60 focus:border-green-500 bg-green-500/5'   : ''}
                        ${inviteStatus === 'invalid' ? 'border-error/60 focus:border-error bg-error/5'               : ''}
                        ${hasInviteError && inviteStatus === 'idle' ? 'border-amber-500/60 ring-1 ring-amber-500/20' : ''}
                        ${(inviteStatus === 'idle' || inviteStatus === 'checking') && !hasInviteError
                          ? 'border-surface-container-high focus:border-primary/50' : ''}
                      `}
                    />
                    {/* Ícone de status */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {inviteStatus === 'checking' && <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />}
                      {inviteStatus === 'valid'    && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {inviteStatus === 'invalid'  && <XCircle className="w-4 h-4 text-error" />}
                    </div>
                  </div>

                  {/* Feedback de status do convite */}
                  {inviteStatus === 'valid' && (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5 px-1">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      Convite válido — você será cadastrado como <strong>{ROLE_LABELS[inviteRole] || inviteRole}</strong>
                    </p>
                  )}
                  {inviteStatus === 'invalid' && inviteCode.trim() && (
                    <p className="text-xs text-error flex items-center gap-1.5 px-1">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      Convite inválido ou já utilizado
                    </p>
                  )}
                  {inviteStatus === 'idle' && !inviteCode.trim() && (
                    <p className="text-xs text-on-surface-variant/60 px-1">
                      Se você já possui uma conta, pode entrar diretamente com Google sem convite.
                    </p>
                  )}
                </div>

                {/* Botão Google */}
                <a
                  href={googleHref}
                  onClick={() => {
                    // Persiste o convite no sessionStorage ANTES do redirect
                    const code = inviteCode.trim();
                    if (code) sessionStorage.setItem(SESSION_INVITE_KEY, code);
                    else sessionStorage.removeItem(SESSION_INVITE_KEY);
                  }}
                  className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-medium transition-all active:scale-[0.98] ${
                    inviteStatus === 'valid'
                      ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                      : 'bg-surface-container border border-surface-container-high text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <GoogleIcon />
                  {inviteStatus === 'valid'
                    ? `Entrar com Google e ativar convite`
                    : 'Entrar com Google'
                  }
                  {inviteStatus === 'valid' && <ArrowRight className="w-4 h-4 ml-auto" />}
                </a>

                {/* Info para usuários existentes */}
                {needsInvite && (
                  <p className="text-center text-xs text-on-surface-variant/60">
                    Já tem conta? Entre com Google sem precisar de convite.
                  </p>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* ABA EMAIL / SENHA                                        */}
            {/* ════════════════════════════════════════════════════════ */}
            {activeTab === 'email' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-primary text-on-primary font-medium transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Entrar
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-on-surface-variant/60">
                  Login por email é apenas para contas com senha cadastrada.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
