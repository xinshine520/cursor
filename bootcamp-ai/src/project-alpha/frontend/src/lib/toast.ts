// Toast 工具函数
// 使用全局 toast 队列来显示通知

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastQueue: Array<ToastOptions & { id: string }> = [];
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach(listener => listener());
}

export function toast(options: ToastOptions) {
  const id = Math.random().toString(36).substring(7);
  toastQueue.push({ ...options, id });
  notify();
  
  // 自动移除（3秒后）
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    notify();
  }, 3000);
}

export function getToasts() {
  return [...toastQueue];
}

export function subscribeToToasts(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

