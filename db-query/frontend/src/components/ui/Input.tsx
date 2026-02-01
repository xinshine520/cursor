import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', style, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'h-10 w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 px-3 text-sm',
          'ring-offset-white dark:ring-offset-gray-800 file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-500 dark:placeholder:text-gray-400',
          'text-gray-900 dark:text-gray-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        style={{ lineHeight: '40px', ...style }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
