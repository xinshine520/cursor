import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import './Input.less';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', error, prefix, suffix, className = '', ...props }, ref) => {
  return (
    <div className={`aliyun-input-wrapper ${error ? 'aliyun-input-error' : ''} ${className}`}>
      {prefix && <span className="aliyun-input-prefix">{prefix}</span>}
      <input
        ref={ref}
        className={`aliyun-input ${prefix ? 'aliyun-input-with-prefix' : ''} ${suffix ? 'aliyun-input-with-suffix' : ''}`}
        {...props}
      />
      {suffix && <span className="aliyun-input-suffix">{suffix}</span>}
    </div>
  );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, showCount, maxLength, className = '', ...props }, ref) => {
    const value = (props.value as string) || '';
    const count = value.length;

    return (
      <div className={`aliyun-textarea-wrapper ${error ? 'aliyun-input-error' : ''} ${className}`}>
        <textarea
          ref={ref}
          className="aliyun-textarea"
          maxLength={maxLength}
          {...props}
        />
        {showCount && maxLength && (
          <div className="aliyun-textarea-count">
            {count} / {maxLength}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

