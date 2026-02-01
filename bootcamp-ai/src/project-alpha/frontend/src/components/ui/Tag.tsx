import { ReactNode, HTMLAttributes } from 'react';
import './Tag.less';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Tag({ children, color, className = '', ...props }: TagProps) {
  return (
    <span
      className={`apple-tag ${className}`}
      style={color ? { backgroundColor: color, color: '#ffffff' } : {}}
      {...props}
    >
      {children}
    </span>
  );
}

