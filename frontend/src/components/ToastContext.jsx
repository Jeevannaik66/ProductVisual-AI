import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    const newToast = { id, ...toast };
    setToasts((s) => [newToast, ...s]);

    // Auto remove
    if (!toast.duration || toast.duration > 0) {
      const removeAfter = toast.duration ?? 4000;
      setTimeout(() => {
        setToasts((s) => s.filter((t) => t.id !== id));
      }, removeAfter);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  const api = {
    show: addToast,
    success: (msg, opts) => addToast({ type: 'success', message: msg, ...opts }),
    error: (msg, opts) => addToast({ type: 'error', message: msg, ...opts }),
    info: (msg, opts) => addToast({ type: 'info', message: msg, ...opts }),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast container */}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col items-end space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-xs w-full px-4 py-3 rounded-lg shadow-lg border ${
              t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{t.title || (t.type === 'error' ? 'Error' : t.type === 'success' ? 'Success' : 'Info')}</div>
                <div className="mt-1 text-sm">{t.message}</div>
              </div>
              <button onClick={() => removeToast(t.id)} className="ml-2 text-sm opacity-70 hover:opacity-100">✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
