import { useState } from 'react';
import {
  AlarmClock,
  AlertTriangle,
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  Minus,
  Palette,
  Plus,
  Smartphone,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import Modal from './Modal';
import { API, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { REWARDS, DEDUCTIONS } from '../utils/format';

const ICONS = {
  Star,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  Palette,
  Trophy,
  Zap,
  Gamepad2,
  AlarmClock,
  Smartphone,
  AlertTriangle,
};

export default function PointsModal({ student, mode, onApplied, onClose }) {
  const { push } = useToast();
  const isAdd = mode === 'add';
  const presets = isAdd ? REWARDS : DEDUCTIONS;
  const presetColor = isAdd ? 'var(--mint)' : 'var(--coral)';

  const [amount, setAmount] = useState(isAdd ? 5 : 1);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const applyPreset = (label) => setReason(label);

  const change = (delta) => {
    setAmount((a) => {
      const next = a + delta;
      if (isAdd) return Math.min(Math.max(next, 0), 100);
      return Math.min(Math.max(next, 0), student.points);
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      push('يرجى اختيار أو كتابة السبب', 'error');
      return;
    }
    if (amount <= 0) {
      push('يرجى إدخال قيمة أكبر من صفر', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data } = await API.post(`/students/${student.id}/points`, {
        points: isAdd ? amount : -amount,
        reason: reason.trim(),
      });
      push(isAdd ? `تمت إضافة ${amount} وزنة` : `تم خصم ${amount} وزنة`);
      onApplied(data);
      onClose();
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {isAdd ? (
            <Star size={20} fill="var(--sun)" strokeWidth={0} color="var(--sun)" />
          ) : (
            <Minus size={20} color="var(--coral)" />
          )}
          {isAdd ? `إضافة نقاط — ${student.name}` : `خصم نقاط — ${student.name}`}
        </span>
      }
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="field">
          <label>عدد الوزنات</label>
          <div className="stepper">
            <button type="button" onClick={() => change(-1)} aria-label="نقص">
              −
            </button>
            <span className="amount">
              {amount}{' '}
              <Star size={22} fill="var(--sun)" strokeWidth={0} color="var(--sun)" style={{ verticalAlign: 'middle' }} />
            </span>
            <button type="button" onClick={() => change(1)} aria-label="زيادة">
              +
            </button>
          </div>
        </div>

        <div className="field">
          <label>{isAdd ? 'سبب المكافأة' : 'سبب الخصم'}</label>
          <div className="row" style={{ gap: 8 }}>
            {presets.map((p) => {
              const Icon = ICONS[p.icon] || Star;
              return (
                <button
                  key={p.label}
                  type="button"
                  className={`reason-chip ${reason === p.label ? 'active' : ''}`}
                  onClick={() => applyPreset(p.label)}
                >
                  <Icon size={16} color={presetColor} style={{ verticalAlign: 'middle' }} /> {p.label}
                </button>
              );
            })}
          </div>
          <textarea
            className="input"
            style={{ marginTop: 10, minHeight: 70, resize: 'vertical' }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="أو اكتب سبباً مخصصاً…"
            maxLength={220}
          />
        </div>

        <div className="row center">
          <button className="btn btn-ghost" type="button" onClick={onClose} disabled={saving}>
            إلغاء
          </button>
          <button className={`btn ${isAdd ? 'btn-mint' : 'btn-coral'}`} type="submit" disabled={saving}>
            {saving ? (
              <span className="spinner" />
            ) : isAdd ? (
              <>
                <Plus size={18} /> إضافة {amount} وزنة
              </>
            ) : (
              <>
                <Minus size={18} /> حذف {amount} وزنة
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}