import { Card } from '../ui/Card';
import './TicketListSkeleton.less';

export function TicketListSkeleton() {
  return (
    <div className="apple-tickets-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="apple-ticket-col">
          <Card className="apple-ticket-card" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="apple-skeleton-content">
              <div className="apple-skeleton-header">
                <div className="apple-skeleton-title" />
                <div className="apple-skeleton-tag" />
              </div>
              <div className="apple-skeleton-description" />
              <div className="apple-skeleton-description short" />
              <div className="apple-skeleton-labels">
                <div className="apple-skeleton-label" />
                <div className="apple-skeleton-label" />
              </div>
              <div className="apple-skeleton-footer">
                <div className="apple-skeleton-time" />
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

