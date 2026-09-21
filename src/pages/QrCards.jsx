import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { BadgePlus, Layers, Printer, Trash2 } from 'lucide-react';
import { API, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function QrCards() {
  const { push } = useToast();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await API.get('/qr/pending');
      setTokens(data.tokens);
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setBusy(true);
    try {
      const { data } = await API.post('/qr/generate', { count: Number(count) || 1 });
      push(`تم توليد ${data.count} بطاقة QR جديدة`);
      setCount(10);
      await load();
    } catch (err) {
      push(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('هل تريد حذف هذه البطاقة؟')) return;
    try {
      await API.delete(`/qr/pending/${id}`);
      push('تم حذف البطاقة');
      await load();
    } catch (err) {
      push(errorMessage(err), 'error');
    }
  };

  const handlePrint = () => window.print();

  return (
    <>
      <div className="no-print">
        <div className="page-head">
        <h1 className="page-title">
          <Layers size={30} color="var(--grape)" /> بطاقات QR
        </h1>
        <span className="chip active">{tokens.length} بطاقة غير مُسجّلة</span>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="qr-toolbar">
          <div>
            <h3 style={{ margin: 0 }}>توليد بطاقات QR فارغة</h3>
            <p style={{ color: 'var(--muted)', fontWeight: 700, margin: '4px 0 0' }}>
              بطاقات غير مربوطّة بأي طفل حتى الآن — اطبعها ووزّعها، وعند المسح يُسجّل الطفل ويرتبط بالرمز تلقائياً.
            </p>
          </div>
          <div className="qr-gen">
            <input
              type="number"
              min="1"
              max="500"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <button className="btn btn-grape btn-lg" onClick={generate} disabled={busy}>
              <BadgePlus size={18} /> {busy ? 'جارٍ التوليد…' : 'توليد'}
            </button>
            <button className="btn btn-sun btn-lg" onClick={handlePrint} disabled={!tokens.length}>
              <Printer size={18} /> طباعة كل البطاقات
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty">جارٍ التحميل…</div>
      ) : tokens.length === 0 ? (
        <div className="empty">
          <div className="big-ico">
            <Layers size={58} color="var(--grape)" />
          </div>
          لا توجد بطاقات QR حتى الآن —
          اضغط «توليد» لإنشاء بطاقات جديدة.
        </div>
      ) : (
        <div className="qr-cards">
          {tokens.map((t) => (
            <div key={t.id} className="qr-card">
              <span className="qr-chip">
                <Layers size={13} /> بطاقة غير مُسجّلة
              </span>
              <div className="qr-code-box">
                <QRCodeCanvas value={t.code} size={140} level="M" includeMargin={false} />
              </div>
              <div className="qr-code-txt">{t.code}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(t.id)}>
                <Trash2 size={15} /> حذف البطاقة
              </button>
            </div>
          ))}
        </div>
      )}
      </div>

      <div className="print-area print-cards" aria-hidden="true">
        {tokens.map((t) => (
          <div key={`p-${t.id}`} className="idcard">
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
              <div className="id-photo">صورة الطفل</div>
              <div className="id-fields">
                <div className="id-field">
                  <span className="f-label">اسم الطفل</span>
                  <span className="f-line" />
                </div>
                <div className="id-field">
                  <span className="f-label">الفصل</span>
                  <span className="f-line" />
                </div>
              </div>
              <div className="id-sep" />
              <div className="id-qr">
                <div className="qr-frame">
                  <QRCodeCanvas value={t.code} size={110} level="M" includeMargin={false} />
                </div>
                <div className="qr-code">{t.code}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}