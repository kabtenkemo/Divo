import { useState } from 'react';
import { AtSign, Camera, KeyRound, Lock, Save, ShieldCheck, User, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../api/client';
import { readAndResizeImage } from '../utils/photo';
import { firstLetter, avatarColor } from '../utils/format';

export default function Account() {
  const { admin, updateProfile, changePassword } = useAuth();
  const { push } = useToast();

  const [name, setName] = useState(admin?.name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [photo, setPhoto] = useState(admin?.photoBase64 || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await readAndResizeImage(file));
    } catch {
      push('تعذر قراءة الصورة', 'error');
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      push('يرجى إدخال الاسم والبريد الإلكتروني', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), photoBase64: photo || null });
      push('تم تحديث بيانات الحساب');
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!current || !next) {
      push('يرجى إدخال كلمة المرور الحالية والجديدة', 'error');
      return;
    }
    if (next.length < 6) {
      push('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف', 'error');
      return;
    }
    if (next !== confirm) {
      push('كلمتا المرور الجديدتان غير متطابقتين', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      push('تم تغيير كلمة المرور بنجاح');
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">
          <UserCog size={30} color="var(--grape)" /> حسابي
        </h1>
      </div>

      <div className="grid-account">
        <div className="card">
          <div className="card-title">
            <User size={20} color="var(--coral)" /> البيانات الشخصية
          </div>
          <form onSubmit={saveProfile}>
            <div className="account-head">
              <label className="account-avatar" title="تغيير الصورة">
                {photo ? (
                  <img src={photo} alt={name} />
                ) : (
                  <span style={{ background: avatarColor(name), color: '#fff', display: 'grid', placeItems: 'center', width: '100%', height: '100%', fontWeight: 900, fontSize: 40 }}>
                    {firstLetter(name)}
                  </span>
                )}
                <span className="account-avatar-edit">
                  <Camera size={18} />
                </span>
                <input type="file" accept="image/*" hidden onChange={handleFile} />
              </label>
              <div>
                <div className="account-role">{admin?.role === 'SuperAdmin' ? 'مدير عام' : 'مدرس'}</div>
                <small style={{ color: 'var(--muted)', fontWeight: 700 }}>اضغط الصورة لتغييرها</small>
              </div>
            </div>

            <div className="field">
              <label>
                <User size={15} style={{ verticalAlign: 'middle' }} /> الاسم
              </label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="اسمك"
              />
            </div>

            <div className="field">
              <label>
                <AtSign size={15} style={{ verticalAlign: 'middle' }} /> البريد الإلكتروني
              </label>
              <input
                className="input"
                type="email"
                dir="ltr"
                style={{ textAlign: 'start' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="row center" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-coral" type="submit" disabled={savingProfile}>
                {savingProfile ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <Save size={18} /> حفظ البيانات
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-title">
            <KeyRound size={20} color="var(--sky)" /> كلمة المرور
          </div>
          <form onSubmit={savePassword}>
            <div className="field">
              <label>
                <Lock size={15} style={{ verticalAlign: 'middle' }} /> كلمة المرور الحالية
              </label>
              <input className="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="field">
              <label>
                <KeyRound size={15} style={{ verticalAlign: 'middle' }} /> كلمة المرور الجديدة
              </label>
              <input className="input" type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="6 أحرف على الأقل" />
            </div>
            <div className="field">
              <label>تأكيد كلمة المرور الجديدة</label>
              <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="أعد كتابة كلمة المرور" />
            </div>
            <p className="hint">
              <ShieldCheck size={15} style={{ verticalAlign: 'middle' }} /> يُنصح بتغيير كلمة المرور دورياً للحفاظ على أمان حسابك.
            </p>
            <div className="row center" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-sky" type="submit" disabled={savingPassword}>
                {savingPassword ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <Save size={18} /> حفظ كلمة المرور
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}