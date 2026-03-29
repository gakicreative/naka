import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useApp } from '../components/AppProvider';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

// Ícone Google SVG
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const ROLE_LABELS: Record<string, string> = {
  socio:   'Sócio',
  seeder:  'Seeder (Funcionário)',
  cliente: 'Cliente',
};

interface InviteInfo {
  id: string;
  role: string;
  valid: boolean;
}

export function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const setSession = useStore((s) => s.setSession);
  const { isAuthReady, setUserName } = useApp();

  const inviteId = searchParams.get('invite') || '';

  const [invite, setInvite]   = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [loading, setLoading] = useState(true);

  // Form de senha (alternativa ao Google)
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redireciona se já logado
  useEffect(() => {
    if (isAuthReady && session) {
      navigate(session.role === 'cliente' ? '/portal' : '/');
    }
  }, [isAuthReady, session, navigate]);

  // Verifica convite
  useEffect(() => {
    if (!inviteId) {
      setInviteError('Link de convite ausente ou inválido.');
      setLoading(false);
      return;
    }
    fetch(`/api/invitations/check/${inviteId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Convite inválido');
        setInvite(data);
      })
      .catch((err) => setInviteError(err.message))
      .finally(() => setLoading(false));
  }, [inviteId]);


  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, inviteId }),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error || 'Erro ao criar conta');
        return;
      }
      const data = await res.json();
      const user = data.user ?? data;
      setSession({ role: user.role, name: user.name, email: user.email, activeClientId: user.activeClientId });
      setUserName(user.name);
      toast.success('Conta criada com sucesso!');
    } catch {
      toast.error('Erro ao criar conta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-headline font-bold text-3xl mx-auto shadow-lg shadow-primary/20">
            N
          </div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-on-surface">Naka OS</h1>
          <p className="text-on-surface-variant text-sm">Bem-vindo(a) à plataforma</p>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-8 border border-surface-container-high shadow-xl space-y-6">

          {/* Erro de convite */}
          {inviteError && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center mx-auto">
                <span className="text-2xl">🚫</span>
              </div>
              <p className="text-on-surface-variant text-sm">{inviteError}</p>
              <p className="text-xs text-on-surface-variant/60">
                Entre em contato com o administrador para receber um convite válido.
              </p>
            </div>
          )}

          {/* Convite válido */}
          {invite && !inviteError && (
            <>
              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-primary uppercase tracking-wider">Você foi convidado como</p>
                <p className="text-2xl font-headline font-bold text-on-surface">
                  {ROLE_LABELS[invite.role] || invite.role}
                </p>
              </div>

              <div className="space-y-3">
                {/* usa <a> nativo para o SW não interceptar */}
                <a
                  href={`/api/auth/google?invite=${inviteId}`}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-surface-container border border-surface-container-high text-on-surface font-medium transition-all hover:bg-surface-container-high active:scale-[0.98]"
                >
                  <GoogleIcon />
                  Continuar com Google
                </a>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-surface-container-high" />
                  <span className="text-xs text-on-surface-variant">ou</span>
                  <div className="h-px flex-1 bg-surface-container-high" />
                </div>

                {!showForm ? (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
                  >
                    Criar conta com email e senha
                  </button>
                ) : (
                  <form onSubmit={handlePasswordRegister} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Nome</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Seu nome completo"
                        className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">E-mail</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="seu@email.com"
                        className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Senha</label>
                      <div className="relative">
                        <input
                          type={showPwd ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-primary text-on-primary font-medium transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      ) : 'Criar conta'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="w-full text-xs text-on-surface-variant hover:text-on-surface transition-colors py-1"
                    >
                      Cancelar
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          <p className="text-center text-xs text-on-surface-variant/60">
            Já tem conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
