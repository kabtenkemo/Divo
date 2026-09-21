import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Moon, PartyPopper, Smile, Rocket, Star, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const DECOS = [
  { cls: 'deco-1', Icon: PartyPopper, color: 'var(--coral)' },
  { cls: 'deco-2', Icon: Star, color: 'var(--sun)' },
  { cls: 'deco-3', Icon: Smile, color: 'var(--sky)' },
  { cls: 'deco-4', Icon: Rocket, color: 'var(--grape)' },
  { cls: 'deco-5', Icon: Star, color: 'var(--mint)' },
];

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      push('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <button className="theme-toggle theme-toggle-float" onClick={toggle} title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}>
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="app-bg">
        {DECOS.map(({ cls, Icon, color }) => (
          <span key={cls} className={`deco ${cls}`}>
            <Icon size={42} color={color} strokeWidth={2} />
          </span>
        ))}
      </div>

      <form className="login-card" onSubmit={submit}>
        <img className="logo" src="/logo.png" alt="شعار Divo" />
        <h1 style={{ color: 'var(--coral-strong)', fontSize: 30 }}>مرحباً بك في نجوم!</h1>
        <p className="login-tagline">سجّل الدخول لإدارة نقاط طلابك</p>

        <div className="field">
          <label>
            <Mail size={15} /> البريد الإلكتروني
          </label>
          <input
            className="input"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label>
            <KeyRound size={15} /> كلمة المرور
          </label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button className="btn btn-coral btn-lg btn-block" type="submit" disabled={busy}>
          {busy ? <span className="spinner" /> : (
            <>
              <Rocket size={20} /> دخول
            </>
          )}
        </button>
      </form>
    </div>
  );
}