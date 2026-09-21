import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Layers, ListChecks, Pencil, QrCode, Save, ShieldCheck, Sparkles, Star, Trophy, Users, Waves } from 'lucide-react';
import { API, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import StudentAvatar from '../components/StudentAvatar';

export default function Dashboard() {
  const { admin } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [welcome, setWelcome] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    API.get('/dashboard')
      .then(({ data }) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => push(errorMessage(err), 'error'));
    API.get('/settings')
      .then(({ data }) => {
        if (!cancelled) setWelcome(data.welcomeMessage);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [push]);

  const openEdit = () => {
    setDraft(welcome);
    setEditOpen(true);
  };

  const saveWelcome = async (e) => {
    e.preventDefault();
    if (!draft.trim()) {
      push('يرجى كتابة الرسالة', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data } = await API.put('/settings', { welcomeMessage: draft.trim() });
      setWelcome(data.welcomeMessage);
      setEditOpen(false);
      push('تم تحديث الرسالة');
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            <Waves size={30} color="var(--sky)" /> أهلاً {admin?.name}
          </h1>
          <p className="welcome-line">
            {welcome}
            <button className="welcome-edit" onClick={openEdit} title="تعديل الرسالة">
              <Pencil size={14} />
            </button>
          </p>
        </div>
        <div className="row">
          <button className="btn btn-grape" onClick={() => navigate('/students')}>
            <Users size={18} /> إدارة الأطفال
          </button>
          <button className="btn btn-sky" onClick={() => navigate('/scan')}>
            <QrCode size={18} /> مسح QR
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <div className="stat stat-coral">
          <GraduationCap size={32} />
          <span className="num">{stats?.studentsCount ?? '…'}</span>
          <span className="lbl">عدد الأطفال</span>
        </div>
        <div className="stat stat-sky">
          <Star size={32} fill="currentColor" strokeWidth={0} />
          <span className="num">{stats?.pointsToday ?? '…'}</span>
          <span className="lbl">وزنات اليوم</span>
        </div>
        <div className="stat stat-sun">
          <ListChecks size={32} />
          <span className="num">{stats?.transactionsCount ?? '…'}</span>
          <span className="lbl">عملية نقاط</span>
        </div>
        <div className="stat stat-grape">
          <ShieldCheck size={32} />
          <span className="num">{stats?.adminsCount ?? '…'}</span>
          <span className="lbl">عدد المدرسين</span>
        </div>
        <Link to="/qrcards" className="stat stat-mint" style={{ textDecoration: 'none' }}>
          <Layers size={32} />
          <span className="num">{stats?.pendingQrCount ?? '…'}</span>
          <span className="lbl">بطاقات QR جاهزة</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-title">
          <Trophy size={22} color="var(--sun)" /> لوحة الأبطال
        </div>
        <p style={{ color: 'var(--muted)', fontWeight: 700, marginBottom: 14 }}>
          أفضل الأطفال حصداً للوزنات
        </p>
        {stats?.topStudents?.length ? (
          stats.topStudents.map((s, i) => (
            <Link to={`/students/${s.id}`} key={s.id} className="lb-row" style={{ textDecoration: 'none' }}>
              <span className="lb-rank">{i + 1}</span>
              <StudentAvatar student={s} size={46} />
              <div>
                <div className="lb-name">{s.name}</div>
                <div className="lb-class">الفصل {s.className}</div>
              </div>
              <span className="lb-points">
                <Star size={14} fill="currentColor" strokeWidth={0} /> {s.points}
              </span>
            </Link>
          ))
        ) : (
          <div className="empty">
            <div className="big-ico">
              <Sparkles size={64} color="var(--sun)" />
            </div>
            لا يوجد أطفال بعد… أضف أول طفل!
          </div>
        )}
      </div>

      {editOpen && (
        <Modal title="تعديل رسالة الترحيب" onClose={() => setEditOpen(false)}>
          <form onSubmit={saveWelcome}>
            <div className="field">
              <label>الرسالة التي تظهر تحت «أهلاً»</label>
              <textarea
                className="input"
                style={{ minHeight: 90, resize: 'vertical' }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={300}
                autoFocus
              />
            </div>
            <div className="row center">
              <button className="btn btn-ghost" type="button" onClick={() => setEditOpen(false)} disabled={saving}>
                إلغاء
              </button>
              <button className="btn btn-sky" type="submit" disabled={saving}>
                {saving ? <span className="spinner" /> : (
                  <>
                    <Save size={18} /> حفظ
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}