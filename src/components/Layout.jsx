import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Cloud, Home, Layers, LogOut, Menu, Moon, PartyPopper, QrCode, Rainbow, ShieldCheck, Smile, Star, Sun, UserCog, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ChangePasswordModal from './ChangePasswordModal';

const DECOS = [
  { cls: 'deco-1', Icon: Star, color: 'var(--sun)' },
  { cls: 'deco-2', Icon: Cloud, color: 'var(--sky)' },
  { cls: 'deco-3', Icon: PartyPopper, color: 'var(--coral)' },
  { cls: 'deco-4', Icon: Rainbow, color: 'var(--grape)' },
  { cls: 'deco-5', Icon: Smile, color: 'var(--mint)' },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <div className="app-bg">
        {DECOS.map(({ cls, Icon, color }) => (
          <span key={cls} className={`deco ${cls}`}>
            <Icon size={42} color={color} strokeWidth={2} />
          </span>
        ))}
      </div>

      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="شعار Divo" />
          <div className="brand-name">
            مدارس الأحد
            <small>كنيسة الإيمان ابن الحكم · نظام النقاط</small>
          </div>
        </div>

        <button
          className="burger"
          onClick={() => setOpen((o) => !o)}
          aria-label="القائمة"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav${open ? ' open' : ''}`} onClick={(e) => { if (e.target.closest('a, button[title]')) setOpen(false); }}>
          <NavLink to="/" end>
            <Home size={18} /> الرئيسية
          </NavLink>
          <NavLink to="/students">
            <Users size={18} /> الأطفال
          </NavLink>
          <NavLink to="/scan">
            <QrCode size={18} /> مسح QR
          </NavLink>
          <NavLink to="/qrcards">
            <Layers size={18} /> بطاقات QR
          </NavLink>
          {admin?.role === 'SuperAdmin' && (
            <NavLink to="/admins">
              <ShieldCheck size={18} /> المدرسون
            </NavLink>
          )}
          <NavLink to="/account">
            {admin?.photoBase64 ? (
              <img className="nav-avatar" src={admin.photoBase64} alt={admin.name} />
            ) : (
              <UserCog size={18} />
            )}{' '}
            حسابي
          </NavLink>
          <button className="theme-toggle" onClick={toggle} title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="تسجيل الخروج">
            <LogOut size={16} /> خروج
          </button>
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>

      {admin?.mustChangePassword && <ChangePasswordModal />}
    </div>
  );
}