import './Spinner.less';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Spinner({ size = 'medium', className = '' }: SpinnerProps) {
  return (
    <div className={`aliyun-spinner aliyun-spinner-${size} ${className}`}>
      <div className="aliyun-spinner-circle" />
    </div>
  );
}

