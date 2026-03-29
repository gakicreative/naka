import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useApp } from '../components/AppProvider';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const setSession = useStore((s) => s.setSession);
  const { isAuthReady, setUserName } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthReady && session) {
      if (session.role === 'cliente') {
        navigate('/portal');
      } else {
        navigate('/');
      }
    }
  }, [isAuthReady, session, navigate]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        toast.error((err as any).error || t('login.error'));
        return;
      }
      const user = await res.json();
      setSession({
        role: user.role,
        name: user.name,
        email: user.email,
        activeClientId: user.activeClientId,
      });
      setUserName(user.name);
      toast.success(t('login.success'));
    } catch (err) {
      console.error('Login error:', err);
      toast.error(t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">
        {/* Logo + Title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-headline font-bold text-3xl mx-auto shadow-lg shadow-primary/20">
            N
          </div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-on-surface">
            Naka OS
          </h1>
          <p className="text-on-surface-variant text-sm">
            {t('login.subtitle')}
          </p>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-8 border border-surface-container-high shadow-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-primary/50 transition-colors text-on-surface"
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
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-primary text-on-primary font-medium transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
          </form>
        </div>
      </div>
    </div>
  );
}
