import { useState } from 'react';
import { Backpack, Camera, Pencil, Plus, QrCode, Save, Sparkles, User } from 'lucide-react';
import Modal from './Modal';
import { API, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { readAndResizeImage } from '../utils/photo';

export default function StudentFormModal({ student, classes, onSaved, onClose, qrCode }) {
  const { push } = useToast();
  const [name, setName] = useState(student?.name || '');
  const [className, setClassName] = useState(student?.className || '');
  const [customClass, setCustomClass] = useState('');
  const [photo, setPhoto] = useState(student?.photoBase64 || '');
  const [saving, setSaving] = useState(false);

  const finalClass = className === '__custom__' ? customClass : className;
  const linkingQr = !student && qrCode;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await readAndResizeImage(file);
      setPhoto(resized);
    } catch {
      push('تعذر قراءة الصورة', 'error');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !finalClass.trim()) {
      push('يرجى إدخال اسم الطفل والفصل', 'error');
      return;
    }
    setSaving(true);
    try {
      if (student) {
        const { data } = await API.put(`/students/${student.id}`, {
          name: name.trim(),
          className: finalClass.trim(),
          photoBase64: photo || null,
        });
        push('تم تحديث بيانات الطفل');
        onSaved(data);
      } else {
        const { data } = await API.post('/students', {
          name: name.trim(),
          className: finalClass.trim(),
          photoBase64: photo || null,
          ...(linkingQr ? { qrCode } : {}),
        });
        push(linkingQr ? 'تم ربط الطفل بهذا الرمز بنجاح' : 'تمت إضافة الطفل بنجاح');
        onSaved(data);
      }
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const options = Array.from(new Set([...(classes || []), className, 'الأول', 'الثاني', 'الثالث'])).filter(
    (c) => c && c !== '__custom__'
  );

  return (
    <Modal
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {student ? (
            <Pencil size={20} color="var(--coral)" />
          ) : linkingQr ? (
            <QrCode size={20} color="var(--grape)" />
          ) : (
            <Sparkles size={20} color="var(--sun)" />
          )}
          {student ? 'تعديل طفل' : linkingQr ? 'ربط QR بطفل جديد' : 'إضافة طفل جديد'}
        </span>
      }
      onClose={onClose}
    >
      <form onSubmit={submit}>
        {linkingQr && (
          <div className="qr-info">
            <QrCode size={20} color="var(--grape)" style={{ flex: 'none' }} />
            <span>
              سيُربط الطفل بهذا الرمز:
              <b dir="ltr" style={{ display: 'block', direction: 'ltr', textAlign: 'start' }}>{qrCode}</b>
            </span>
          </div>
        )}
        <div className="field">
          <label>
            <User size={15} style={{ verticalAlign: 'middle' }} /> اسم الطفل
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: آدم محمد"
            maxLength={120}
          />
        </div>

        <div className="field">
          <label>
            <Backpack size={15} style={{ verticalAlign: 'middle' }} /> الفصل
          </label>
          <select className="select" value={className} onChange={(e) => setClassName(e.target.value)}>
            <option value="">اختر الفصل…</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
            <option value="__custom__">فصل جديد…</option>
          </select>
        </div>

        {className === '__custom__' && (
          <div className="field">
            <input
              className="input"
              value={customClass}
              onChange={(e) => setCustomClass(e.target.value)}
              placeholder="اسم الفصل الجديد"
              maxLength={60}
            />
          </div>
        )}

        <div className="field">
          <label>
            <Camera size={15} style={{ verticalAlign: 'middle' }} /> الصورة الشخصية
          </label>
          <label className="photo-picker">
            {photo ? (
              <img className="photo-preview" src={photo} alt="معاينة" />
            ) : (
              <span
                className="photo-preview"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--cream-2)',
                  color: 'var(--muted)',
                }}
              >
                <User size={34} />
              </span>
            )}
            <span style={{ fontWeight: 800 }}>
              {photo ? 'تغيير الصورة' : 'اضغط لاختيار صورة'}
              <small style={{ display: 'block', fontWeight: 700, color: 'var(--muted)' }}>
                PNG أو JPG — تتم تصغيرها تلقائياً
              </small>
            </span>
            <input type="file" accept="image/*" hidden onChange={handleFile} />
          </label>
        </div>

        <div className="row center" style={{ marginTop: 22 }}>
          <button className="btn btn-ghost" type="button" onClick={onClose} disabled={saving}>
            إلغاء
          </button>
          <button className="btn btn-coral" type="submit" disabled={saving}>
            {saving ? (
              <span className="spinner" />
            ) : student ? (
              <>
                <Save size={18} /> حفظ التعديلات
              </>
            ) : (
              <>
                <Plus size={18} /> إضافة الطفل
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}