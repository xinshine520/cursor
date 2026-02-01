import { ReactNode } from 'react';
import { Spinner } from './Spinner';
import './Spin.less';

interface SpinProps {
  spinning: boolean;
  children: ReactNode;
  className?: string;
}

export function Spin({ spinning, children, className = '' }: SpinProps) {
  return (
    <div className={`aliyun-spin-wrapper ${className}`}>
      {spinning && (
        <div className="aliyun-spin-overlay">
          <Spinner size="large" />
        </div>
      )}
      <div className={`aliyun-spin-content ${spinning ? 'aliyun-spin-content-blur' : ''}`}>
        {children}
      </div>
    </div>
  );
}

