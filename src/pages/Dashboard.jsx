import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Layers, ListChecks, QrCode, ShieldCheck, Sparkles, Star, Trophy, Users, Waves } from 'lucide-react';
import { API, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StudentAvatar from '../components/StudentAvatar';

export default function Dashboard() {
  const { admin } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    API.get('/dashboard')
      .then(({ data }) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => push(errorMessage(err), 'error'));
    return () => {
      cancelled = true;
    };
  }, [push]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            <Waves size={30} color="var(--sky)" /> أهلاً {admin?.name}
          </h1>
          <p style={{ color: 'var(--muted)', fontWeight: 700 }}>هيّا بنا نوزّع النجوم اليوم!</p>
        </div>
        <div className="row">
          <button className="btn btn-grape" onClick={() => navigate('/students')}>
            <Users size={18} /> إدارة الطلاب
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
          <span className="lbl">عدد الطلاب</span>
        </div>
        <div className="stat stat-sky">
          <Star size={32} fill="currentColor" strokeWidth={0} />
          <span className="num">{stats?.pointsToday ?? '…'}</span>
          <span className="lbl">نجوم اليوم</span>
        </div>
        <div className="stat stat-sun">
          <ListChecks size={32} />
          <span className="num">{stats?.transactionsCount ?? '…'}</span>
          <span className="lbl">عملية نقاط</span>
        </div>
        <div className="stat stat-grape">
          <ShieldCheck size={32} />
          <span className="num">{stats?.adminsCount ?? '…'}</span>
          <span className="lbl">عدد المشرفين</span>
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
          أفضل الطلاب حصداً للنجوم
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
            لا يوجد طلاب بعد… أضف أول طالب!
          </div>
        )}
      </div>
    </>
  );
}