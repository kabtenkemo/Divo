import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowRight, CalendarDays, Clock, Ghost, Hash, Inbox, Minus, Pencil, Printer, QrCode, Star } from 'lucide-react';
import { API } from '../api/client';
import { formatDateTime } from '../utils/format';
import PointsModal from '../components/PointsModal';
import StudentFormModal from '../components/StudentFormModal';
import StudentAvatar from '../components/StudentAvatar';
import PointsBadge from '../components/PointsBadge';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [mode, setMode] = useState(null); // 'add' | 'minus' | null
  const [editing, setEditing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    API.get(`/students/${id}`)
      .then(({ data }) => setStudent(data))
      .catch(() => setNotFound(true));
    API.get(`/students/${id}/transactions`)
      .then(({ data }) => setTransactions(data))
      .catch(() => {});
    API.get('/students/classes')
      .then(({ data }) => setClasses(data))
      .catch(() => {});
  }, [id]);

  const refresh = () => {
    API.get(`/students/${id}`).then(({ data }) => setStudent(data));
    API.get(`/students/${id}/transactions`).then(({ data }) => setTransactions(data));
  };

  if (notFound) {
    return (
      <div className="empty">
        <div className="big-ico">
          <Ghost size={64} color="var(--grape)" />
        </div>
        الطالب غير موجود
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-coral" onClick={() => navigate('/students')}>
            <ArrowRight size={18} /> العودة للطلاب
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="empty">
        <div className="big-ico">
          <Clock size={58} color="var(--sky)" />
        </div>
        جارٍ التحميل…
      </div>
    );
  }

  const qrValue = student.qrCode;
  const printCard = () => window.print();

  return (
    <>
      <div className="no-print">
        <button className="link" onClick={() => navigate('/students')} style={{ marginBottom: 14 }}>
        <ArrowRight size={16} style={{ verticalAlign: 'middle' }} /> العودة لقائمة الطلاب
      </button>

      <div className="grid-profile">
        <div className="card">
          <div className="row spread">
            <div className="row">
              <StudentAvatar student={student} size={92} circle />
              <div>
                <h2 style={{ fontSize: 24 }}>{student.name}</h2>
                <span className="class-chip">الفصل {student.className}</span>
              </div>
            </div>
            <PointsBadge points={student.points} size={20} style={{ fontSize: 20, padding: '10px 22px' }} />
          </div>

          <div className="kv" style={{ marginTop: 14 }}>
            <span className="k">الفصل</span>
            <span className="v">{student.className}</span>
          </div>
          <div className="kv">
            <span className="k">
              <Hash size={15} style={{ verticalAlign: 'middle' }} /> رقم الطالب
            </span>
            <span className="v">{`#${student.id}`}</span>
          </div>
          <div className="kv">
            <span className="k">
              <CalendarDays size={15} style={{ verticalAlign: 'middle' }} /> تاريخ الاشتراك
            </span>
            <span className="v">{formatDateTime(student.createdAt)}</span>
          </div>

          <div className="row center" style={{ marginTop: 20, gap: 12 }}>
            <button className="btn btn-mint btn-lg" onClick={() => setMode('add')}>
              <Star size={18} fill="currentColor" strokeWidth={0} /> إضافة نقاط
            </button>
            <button className="btn btn-coral btn-lg" onClick={() => setMode('minus')} disabled={student.points <= 0}>
              <Minus size={18} /> خصم نقاط
            </button>
            <button className="btn btn-ghost" onClick={() => setEditing(true)}>
              <Pencil size={16} /> تعديل
            </button>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title" style={{ justifyContent: 'center' }}>
            <QrCode size={20} color="var(--grape)" /> بطاقة الطالب (QR)
          </div>
          <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>
            اطبعها وامسحها من شاشة «مسح QR» لإضافة أو خصم النقاط
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
            <div className="qr-box">
              <QRCodeCanvas value={qrValue} size={200} level="H" includeMargin />
            </div>
          </div>
          <button className="btn btn-sun btn-sm" onClick={printCard}>
            <Printer size={16} /> طباعة البطاقة
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">
          <Clock size={20} color="var(--sky)" /> سجل النقاط
        </div>
        {transactions.length === 0 ? (
          <div className="empty">
            <div className="big-ico">
              <Inbox size={60} color="var(--mint)" />
            </div>
            لا توجد معاملات بعد… امنح أول نجمة!
          </div>
        ) : (
          <ul className="timeline">
            {transactions.map((t) => (
              <li key={t.id}>
                <span className={`t-ico ${t.points > 0 ? 't-plus' : 't-minus'}`}>
                  {t.points > 0 ? '+' : '−'}
                </span>
                <div className="t-body">
                  <div className="t-reason">
                    {t.reason} · <b>{Math.abs(t.points)}</b> نقطة
                  </div>
                  <div className="t-meta">
                    <span>المشرف: {t.adminName}</span>
                    <span>{formatDateTime(t.createdAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {mode && (
        <PointsModal
          student={student}
          mode={mode}
          onApplied={() => refresh()}
          onClose={() => setMode(null)}
        />
      )}

      {editing && (
        <StudentFormModal
          student={student}
          classes={classes}
          onSaved={(updated) => {
            setStudent(updated);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}

      </div>

      <div className="print-area">
        <div className="idcard">
          <div className="id-top-band">
            <div className="band-logo-wrap">
              <img className="band-logo" src="/logo.png" alt="Divo" />
            </div>
            <div>
              <div className="band-school">مدارس الأحد</div>
              <div className="band-sub">كنيسة الإيمان ابن الحكم · نظام النقاط</div>
            </div>
          </div>
          <div className="id-content">
            <div className="id-photo">
              {student.photoBase64 ? <img src={student.photoBase64} alt={student.name} /> : 'صورة الطالب'}
            </div>
            <div className="id-fields">
              <div className="id-field">
                <span className="f-label">اسم الطالب</span>
                <span className="f-value">{student.name}</span>
              </div>
              <div className="id-field">
                <span className="f-label">الفصل</span>
                <span className="f-value">الفصل {student.className}</span>
              </div>
              <div className="id-field">
                <span className="f-label">النقاط</span>
                <span className="f-value">{student.points} نجمة</span>
              </div>
            </div>
            <div className="id-sep" />
            <div className="id-qr">
              <div className="qr-frame">
                <QRCodeCanvas value={qrValue} size={110} level="H" includeMargin={false} />
              </div>
              <div className="qr-code">{qrValue}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}