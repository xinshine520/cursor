import { useEffect, useState } from 'react';
import { getToasts, subscribeToToasts } from '../../lib/toast';
import type { ToastOptions } from '../../lib/toast';
import './Toaster.less';

export function Toaster() {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: string }>>([]);

  useEffect(() => {
    const updateToasts = () => {
      const currentToasts = getToasts();
      setToasts(currentToasts);
    };
    
    const unsubscribe = subscribeToToasts(updateToasts);
    updateToasts();

    return unsubscribe;
  }, []);

  return (
    <div className="apple-toaster">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`apple-toast apple-toast-${toast.variant || 'default'}`}
        >
          <div className="apple-toast-content">
            <span className="apple-toast-title">{toast.title}</span>
            {toast.description && (
              <span className="apple-toast-description">{toast.description}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
