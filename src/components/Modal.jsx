import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-lg' : ''}`}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="إغلاق">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}