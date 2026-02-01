import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-10 w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 px-3 text-sm',
          'ring-offset-white dark:ring-offset-gray-800 text-gray-900 dark:text-gray-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'appearance-none',
          'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat',
          'pr-10',
          className
        )}
        style={{ lineHeight: '40px', ...style }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
