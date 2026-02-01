import { InputHTMLAttributes, ReactNode, useId } from 'react';
import './Checkbox.less';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children?: ReactNode;
  className?: string;
}

export function Checkbox({ children, className = '', id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <label className={`apple-checkbox-wrapper ${className}`} htmlFor={checkboxId}>
      <input 
        type="checkbox" 
        className="apple-checkbox" 
        id={checkboxId}
        {...props} 
      />
      <span className="apple-checkbox-inner" aria-hidden="true" />
      {children && <span className="apple-checkbox-label">{children}</span>}
    </label>
  );
}

