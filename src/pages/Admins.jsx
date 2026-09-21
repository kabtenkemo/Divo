import { useEffect, useState, useCallback } from 'react';
import { Crown, Info, Mail, Plus, Settings, ShieldCheck, Trash2, User, UserCog } from 'lucide-react';
import { API, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { formatDate } from '../utils/format';

export default function Admins() {
  const { push } = useToast();
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Admin');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    API.get('/admins')
      .then(({ data }) => setAdmins(data))
      .catch((err) => push(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      push('يرجى ملء الاسم والبريد الإلكتروني', 'error');
      return;
    }
    setSaving(true);
    try {
      await API.post('/admins', { name, email, role });
      push('تمت إضافة المشرف بنجاح');
      setShowForm(false);
      setName('');
      setEmail('');
      setRole('Admin');
      load();
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (admin) => {
    if (!window.confirm(`هل تريد حذف المشرف «${admin.name}»؟`)) return;
    try {
      await API.delete(`/admins/${admin.id}`);
      push('تم حذف المشرف');
      load();
    } catch (err) {
      push(errorMessage(err), 'error');
    }
  };

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">
          <ShieldCheck size={30} color="var(--grape)" /> إدارة المشرفين
        </h1>
        <button className="btn btn-grape" onClick={() => setShowForm(true)}>
          <Plus size={18} /> إضافة مشرف جديد
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">جارٍ التحميل…</div>
        ) : admins.length === 0 ? (
          <div className="empty">لا يوجد مشرفون</div>
        ) : (
          <div className="table-scroll">
            <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>تاريخ الإضافة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>
                    <span className={`chip ${a.role === 'SuperAdmin' ? 'active' : ''}`}>
                      {a.role === 'SuperAdmin' ? (
                        <>
                          <Crown size={15} /> مدير عام
                        </>
                      ) : (
                        <>
                          <UserCog size={15} /> مشرف
                        </>
                      )}
                    </span>
                  </td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => remove(a)}
                      style={{ borderColor: '#f5515f', color: '#f5515f' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="إضافة مشرف جديد" onClose={() => setShowForm(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>
                <User size={15} style={{ verticalAlign: 'middle' }} /> الاسم الكامل
              </label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: محمد أحمد" />
            </div>
            <div className="field">
              <label>
                <Mail size={15} style={{ verticalAlign: 'middle' }} /> البريد الإلكتروني
              </label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@school.com" />
            </div>
            <div className="field">
              <label>
                <Settings size={15} style={{ verticalAlign: 'middle' }} /> الدور
              </label>
              <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Admin">مشرف</option>
                <option value="SuperAdmin">مدير عام (يستطيع إدارة المشرفين)</option>
              </select>
            </div>
            <p className="hint" style={{ marginTop: 0 }}>
              <Info size={15} style={{ verticalAlign: 'middle' }} /> كلمة المرور الافتراضية للمشرف الجديد
              هي <b>admin</b> — وسيُطلب منه تغييرها عند أول تسجيل دخول.
            </p>
            <div className="row center">
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>
                إلغاء
              </button>
              <button className="btn btn-grape" type="submit" disabled={saving}>
                {saving ? <span className="spinner" /> : (
                  <>
                    <Plus size={18} /> إضافة
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