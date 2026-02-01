import { memo, ReactNode, ButtonHTMLAttributes } from 'react';
import './Button.less';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
}

export const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  loading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`aliyun-btn aliyun-btn-${variant} aliyun-btn-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="aliyun-btn-loading" />}
      {icon && <span className="aliyun-btn-icon">{icon}</span>}
      {children && <span className="aliyun-btn-text">{children}</span>}
    </button>
  );
});

