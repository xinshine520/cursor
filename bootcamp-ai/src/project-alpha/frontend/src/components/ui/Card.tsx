import { memo, ReactNode, HTMLAttributes } from 'react';
import './Card.less';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card = memo(function Card({ children, hoverable, className = '', ...props }: CardProps) {
  return (
    <div
      className={`apple-card ${hoverable ? 'apple-card-hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

