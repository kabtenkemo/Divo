import { useState } from 'react';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../api/client';

export default function ChangePasswordModal() {
  const { changePassword } = useAuth();
  const { push } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
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
    setBusy(true);
    try {
      await changePassword(current, next);
      push('تم تغيير كلمة المرور بنجاح');
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="تغيير كلمة المرور" onClose={() => {}} hideClose>
      <p className="hint" style={{ marginTop: 0 }}>
        <ShieldCheck size={16} style={{ verticalAlign: 'middle' }} /> هذه أول مرة تدخل فيها بحسابك — يجب
        تغيير كلمة المرور الافتراضية للمتابعة.
      </p>
      <form onSubmit={submit}>
        <div className="field">
          <label>
            <Lock size={15} style={{ verticalAlign: 'middle' }} /> كلمة المرور الحالية
          </label>
          <input className="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" autoFocus />
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
        <div className="row center">
          <button className="btn btn-coral" type="submit" disabled={busy}>
            {busy ? <span className="spinner" /> : 'حفظ كلمة المرور'}
          </button>
        </div>
      </form>
    </Modal>
  );
}