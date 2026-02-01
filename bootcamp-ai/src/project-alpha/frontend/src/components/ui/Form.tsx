import { ReactNode } from 'react';
import './Form.less';

interface FormProps {
  children: ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

export function Form({ children, className = '', onSubmit }: FormProps) {
  return (
    <form className={`apple-form ${className}`} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

interface FormItemProps {
  label?: string;
  children: ReactNode;
  error?: string;
  className?: string;
}

export function FormItem({ label, children, error, className = '' }: FormItemProps) {
  return (
    <div className={`apple-form-item ${error ? 'apple-form-item-error' : ''} ${className}`}>
      {label && <label className="apple-form-label">{label}</label>}
      {children}
      {error && <div className="apple-form-error-message">{error}</div>}
    </div>
  );
}

Form.Item = FormItem;

