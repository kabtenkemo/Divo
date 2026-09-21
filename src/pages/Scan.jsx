import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Ban, CalendarDays, Minus, PartyPopper, QrCode, RotateCcw, Star, UserPlus } from 'lucide-react';
import { API, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import PointsModal from '../components/PointsModal';
import StudentFormModal from '../components/StudentFormModal';
import StudentAvatar from '../components/StudentAvatar';
import PointsBadge from '../components/PointsBadge';
import { formatDate } from '../utils/format';

export default function Scan() {
  const { push } = useToast();
  const [found, setFound] = useState(null);
  const [pendingCode, setPendingCode] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [starting, setStarting] = useState(false);
  const [permError, setPermError] = useState('');
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  const lookUp = async (code) => {
    if (busyRef.current || !code) return;
    busyRef.current = true;
    try {
      const { data } = await API.get(`/students/by-qr/${encodeURIComponent(code.trim())}`);
      setFound(data);
      await stopScanner();
    } catch (err) {
      await stopScanner();
      if (err?.response?.status === 404) {
        const clean = code.trim().toUpperCase().slice(0, 64);
        setPendingCode(clean);
        push('هذا الرمز غير مسجّل — يمكنك إضافة بيانات الطفل وربطه بهذا الرمز', 'success');
      } else {
        push(`تعذر الاتصال: ${errorMessage(err)}`, 'error');
        setTimeout(() => startScanner(), 1800);
      }
    } finally {
      busyRef.current = false;
    }
  };

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
    setStarting(true);
    try {
      if (scannerRef.current?.isScanning) return;
      const scanner = new Html5Qrcode('qr-reader');
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

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backToScan = () => {
    setPendingCode(null);
    setRegisterOpen(false);
    busyRef.current = false;
    startScanner();
  };

  const again = () => {
    setFound(null);
    setMode(null);
    busyRef.current = false;
    startScanner();
  };

  // --- result: student found / just registered ---
  if (found) {
    return (
      <>
        <div className="page-head">
          <h1 className="page-title">
            <PartyPopper size={30} color="var(--sun)" /> تم العثور على الطفل!
          </h1>
        </div>

        <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', position: 'relative' }}>
              <StudentAvatar student={found} size={120} circle />
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  insetInlineEnd: -8,
                  animation: 'float 2.4s ease-in-out infinite',
                }}
              >
                <PartyPopper size={34} color="var(--coral)" />
              </span>
            </div>
            <h2 style={{ fontSize: 26, marginTop: 14 }}>{found.name}</h2>
            <span className="class-chip">الفصل {found.className}</span>
            <div style={{ margin: '16px 0' }}>
              <PointsBadge points={found.points} size={20} style={{ fontSize: 22, padding: '10px 26px' }} />
            </div>
          </div>

          <div className="kv">
            <span className="k">تاريخ الاشتراك</span>
            <span className="v">
              <CalendarDays size={15} style={{ verticalAlign: 'middle' }} /> {formatDate(found.createdAt)}
            </span>
          </div>

          <div className="row center" style={{ marginTop: 20, gap: 12 }}>
            <button className="btn btn-mint btn-lg" onClick={() => setMode('add')}>
              <Star size={18} fill="currentColor" strokeWidth={0} /> إضافة نقاط
            </button>
            <button
              className="btn btn-coral btn-lg"
              onClick={() => setMode('minus')}
              disabled={found.points <= 0}
            >
              <Minus size={18} /> خصم نقاط
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={again}>
              <QrCode size={16} /> مسح رمز آخر
            </button>
          </div>
        </div>

        {mode && (
          <PointsModal
            student={found}
            mode={mode}
            onApplied={({ student }) => {
              setFound(student);
              push('تم تحديث النقاط');
            }}
            onClose={() => setMode(null)}
          />
        )}
      </>
    );
  }

  // --- result: unregistered QR → offer registration ---
  if (pendingCode) {
    return (
      <>
        <div className="page-head">
          <h1 className="page-title">
            <QrCode size={30} color="var(--grape)" /> رمز غير مسجّل!
          </h1>
        </div>

        <div className="card" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div className="big-ico">
            <UserPlus size={58} color="var(--grape)" />
          </div>
          <p style={{ fontWeight: 800, fontSize: 18 }}>هذا الرمز QR ليس مسجّلاً في النظام بعد.</p>
          <p style={{ color: 'var(--muted)', fontWeight: 700 }}>
            أضف بيانات الطفل وسيُربط الطفل بهذا الرمز مباشرة:
          </p>
          <div className="qr-info" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <QrCode size={20} color="var(--grape)" style={{ flex: 'none' }} />
            <b dir="ltr">{pendingCode}</b>
          </div>

          <div className="row center" style={{ gap: 12 }}>
            <button className="btn btn-grape btn-lg" onClick={() => setRegisterOpen(true)}>
              <UserPlus size={18} /> تسجيل طفل جديد بهذا الرمز
            </button>
            <button className="btn btn-ghost" onClick={backToScan}>
              <RotateCcw size={16} /> مسح رمز آخر
            </button>
          </div>
        </div>

        {registerOpen && (
          <StudentFormModal
            qrCode={pendingCode}
            classes={[]}
            onSaved={(data) => {
              setRegisterOpen(false);
              setPendingCode(null);
              setFound(data);
            }}
            onClose={() => setRegisterOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">
          <QrCode size={30} color="var(--sky)" /> مسح رمز QR
        </h1>
        <span className="chip active">وجّه الكاميرا نحو بطاقة الطفل</span>
      </div>

      <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="scanner-wrap">
          <div id="qr-reader" />
        </div>
        {starting && (
          <div className="empty">
            <div className="big-ico">
              <QrCode size={58} color="var(--sky)" />
            </div>
            جارٍ تشغيل الكاميرا…
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
      </div>
    </>
  );
}