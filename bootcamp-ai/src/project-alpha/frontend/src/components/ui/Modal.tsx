import { ReactNode, useEffect, useRef, useId, useCallback } from 'react';
import './Modal.less';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Modal({ 
  open, 
  onClose, 
  title, 
  children, 
  footer, 
  width = 600, 
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Focus trap: focus the modal when it opens
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
    
    // Trap focus within modal
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [onClose]);

  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (open && e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDownGlobal);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDownGlobal);
    };
  }, [open, onClose]);

  if (!open) return null;

  const modalTitleId = ariaLabelledBy || (title ? titleId : undefined);

  return (
    <div 
      className="apple-modal-mask" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      aria-describedby={descriptionId}
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        className={`apple-modal ${className}`}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {title && (
          <div className="apple-modal-header">
            <h3 className="apple-modal-title" id={titleId}>{title}</h3>
            <button 
              ref={closeButtonRef}
              className="apple-modal-close" 
              onClick={onClose}
              aria-label="关闭对话框"
              type="button"
            >
              ×
            </button>
          </div>
        )}
        <div className="apple-modal-body" id={descriptionId}>{children}</div>
        {footer && <div className="apple-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

