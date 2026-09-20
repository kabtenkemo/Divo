import { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ToastContext = createContext(null);

let seed = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message, type = 'success') => {
    const id = ++seed;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), 3200);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {t.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext) ?? { push: (msg, type) => console.log(msg, type) };
}