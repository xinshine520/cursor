import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-50 text-gray-900 border-gray-200',
      success: 'bg-green-50 text-green-900 border-green-200',
      warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
      error: 'bg-red-50 text-red-900 border-red-200',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={cn('mb-1 font-medium leading-none tracking-tight', className)}
        {...props}
      >
        {children}
      </h5>
    );
  }
);

AlertTitle.displayName = 'AlertTitle';

interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props}>
        {children}
      </div>
    );
  }
);

AlertDescription.displayName = 'AlertDescription';
