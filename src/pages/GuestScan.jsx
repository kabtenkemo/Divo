import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Ban, Crown, LogIn, Moon, QrCode, RotateCcw, Star, Sun } from 'lucide-react';
import { PublicAPI } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import StudentAvatar from '../components/StudentAvatar';
import PointsBadge from '../components/PointsBadge';

export default function GuestScan() {
  const { theme, toggle } = useTheme();
  const [found, setFound] = useState(null);
  const [notFound, setNotFound] = useState('');
  const [starting, setStarting] = useState(false);
  const [permError, setPermError] = useState('');
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  const stopScanner = async () => {
    const s = scannerRef.current;
    if (s && s.isScanning) {
      try {
        await s.stop();
        await s.clear();
      } catch {
        /* noop */
      }
    }
  };

  const startScanner = async () => {
    setPermError('');
    setNotFound('');
    setStarting(true);
    try {
      if (scannerRef.current?.isScanning) return;
      const scanner = new Html5Qrcode('guest-qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => lookUp(decoded),
        () => {}
      );
    } catch {
      setPermError('تعذر الوصول إلى الكاميرا — تأكد من السماح باستخدامها.');
    } finally {
      setStarting(false);
    }
  };

  const lookUp = async (code) => {
    if (busyRef.current || !code) return;
    busyRef.current = true;
    try {
      const { data } = await PublicAPI.get(`/public/scan/${encodeURIComponent(code.trim())}`);
      setFound(data);
      await stopScanner();
    } catch (err) {
      await stopScanner();
      if (err?.response?.status === 404) {
        setNotFound('هذا الرمز غير مسجّل في النظام');
      } else {
        setNotFound('تعذر الاتصال بالسيرفر — حاول مرة أخرى');
      }
    } finally {
      busyRef.current = false;
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const again = () => {
    setFound(null);
    setNotFound('');
    busyRef.current = false;
    startScanner();
  };

  return (
    <div className="guest-wrap">
      <button className="theme-toggle theme-toggle-float" onClick={toggle} title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}>
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="guest-head">
        <img src="/logo.png" alt="شعار" />
        <div>
          <b>مدارس الأحد</b>
          <small>كنيسة الإيمان ابن الحكم · نظام النقاط</small>
        </div>
      </div>

      {found ? (
        <div className="card guest-card">
          <p className="guest-badge">
            <Crown size={16} /> النتيجة
          </p>
          <StudentAvatar student={found} size={110} circle />
          <h2>{found.name}</h2>
          <PointsBadge points={found.points} size={20} style={{ fontSize: 22, padding: '10px 26px', marginTop: 8 }} />
          <div className="row center" style={{ marginTop: 22, gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-coral btn-lg" onClick={again}>
              <RotateCcw size={18} /> مسح رمز آخر
            </button>
            <Link className="btn btn-ghost btn-lg" to="/login">
              <LogIn size={18} /> تسجيل الدخول
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ width: '100%', maxWidth: 640 }}>
          <div className="page-head" style={{ marginBottom: 14 }}>
            <h1 className="page-title">
              <QrCode size={26} color="var(--sky)" /> مسح سريع
            </h1>
            <span className="chip active">بدون تسجيل دخول</span>
          </div>

          <div className="scanner-wrap">
            <div id="guest-qr-reader" />
          </div>

          {starting && (
            <div className="empty">
              <div className="big-ico">
                <QrCode size={58} color="var(--sky)" />
              </div>
              جارٍ تشغيل الكاميرا…
            </div>
          )}

          {notFound && (
            <div className="empty" style={{ color: 'var(--coral-strong)' }}>
              <div className="big-ico">
                <Ban size={58} color="var(--coral)" />
              </div>
              {notFound}
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-coral" onClick={startScanner}>
                  <RotateCcw size={18} /> إعادة المحاولة
                </button>
              </div>
            </div>
          )}

          {permError && (
            <div className="empty" style={{ color: 'var(--coral-strong)' }}>
              <div className="big-ico">
                <Ban size={58} color="var(--coral)" />
              </div>
              {permError}
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-coral" onClick={startScanner}>
                  <RotateCcw size={18} /> إعادة المحاولة
                </button>
              </div>
            </div>
          )}

          <p className="hint" style={{ marginTop: 16, textAlign: 'center' }}>
            <Star size={15} fill="currentColor" strokeWidth={0} style={{ verticalAlign: 'middle' }} /> وجّه
            الكاميرا نحو بطاقة الطالب لعرض الاسم والنقاط فقط.
          </p>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link className="btn btn-ghost" to="/login">
              <LogIn size={16} /> تسجيل الدخول كمشرف
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}