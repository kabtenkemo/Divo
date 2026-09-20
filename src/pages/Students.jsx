import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backpack, Eye, Plus, Search, Sparkles, Trash2, Users } from 'lucide-react';
import { API, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import StudentFormModal from '../components/StudentFormModal';
import StudentAvatar from '../components/StudentAvatar';
import PointsBadge from '../components/PointsBadge';

export default function Students() {
  const { push } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [activeClass, setActiveClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeClass) params.className = activeClass;
      const { data } = await API.get('/students', { params });
      setStudents(data);
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [search, activeClass, push]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    API.get('/students/classes')
      .then(({ data }) => setClasses(data))
      .catch(() => {});
  }, []);

  const handleDelete = async (student) => {
    if (!window.confirm(`هل تريد حذف الطالب «${student.name}»؟ سيتم حذف كل نقاطه.`)) return;
    try {
      await API.delete(`/students/${student.id}`);
      push(`تم حذف ${student.name}`);
      load();
    } catch (err) {
      push(errorMessage(err), 'error');
    }
  };

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">
          <Users size={30} color="var(--coral)" /> الطلاب
        </h1>
        <button className="btn btn-coral" onClick={() => setShowForm(true)}>
          <Plus size={18} /> إضافة طالب
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row">
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search
              size={20}
              color="var(--muted)"
              style={{ position: 'absolute', insetInlineEnd: 14, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              className="input"
              style={{ paddingInlineEnd: 44 }}
              placeholder="ابحث عن طالب…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className={`chip ${activeClass === '' ? 'active' : ''}`} onClick={() => setActiveClass('')}>
              <Backpack size={15} /> الكل
            </button>
            {classes.map((c) => (
              <button
                key={c}
                className={`chip ${activeClass === c ? 'active' : ''}`}
                onClick={() => setActiveClass(activeClass === c ? '' : c)}
              >
                <Backpack size={15} /> {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty">
          <div className="big-ico">
            <Sparkles size={58} color="var(--sky)" />
          </div>
          جارٍ تحميل الطلاب…
        </div>
      ) : students.length === 0 ? (
        <div className="empty">
          <div className="big-ico">
            <Users size={64} color="var(--sun)" />
          </div>
          {search || activeClass ? 'لا توجد نتائج مطابقة' : 'لا يوجد طلاب بعد، أضف أول طالب!'}
        </div>
      ) : (
        <div className="grid-students">
          {students.map((s) => (
            <div key={s.id} className="student-card" onClick={() => navigate(`/students/${s.id}`)}>
              <StudentAvatar student={s} size={96} circle />
              <h3>{s.name}</h3>
              <span className="class-chip">الفصل {s.className}</span>
              <div style={{ marginTop: 10 }}>
                <PointsBadge points={s.points} />
              </div>
              <div className="row center" style={{ marginTop: 12, gap: 8 }} onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-sun btn-sm" onClick={() => navigate(`/students/${s.id}`)}>
                  <Eye size={16} /> عرض
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(s)}
                  style={{ borderColor: '#f5515f', color: '#f5515f' }}
                >
                  <Trash2 size={16} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <StudentFormModal
          classes={classes}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}