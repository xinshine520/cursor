import { memo } from 'react';
import { Button } from '../ui/Button';
import './EmptyState.less';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = memo(function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="apple-empty">
      <div className="apple-empty-icon">
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
          <rect x="20" y="20" width="56" height="56" rx="8" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
          <path d="M36 40L60 40M36 48H52M36 56H48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5"/>
        </svg>
      </div>
      <div className="apple-empty-content">
        <h3 className="apple-empty-title">{title}</h3>
        {description && (
          <p className="apple-empty-description">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="large"
          onClick={onAction}
          className="apple-empty-button"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
});

