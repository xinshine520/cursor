import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './MainLayout.less';

interface MainLayoutProps {
  children: ReactNode;
  selectedLabelIds: string[];
  onLabelSelect: (labelId: string | null) => void;
  onCreateTicket: () => void;
  onCreateLabel: () => void;
}

export function MainLayout({
  children,
  selectedLabelIds,
  onLabelSelect,
  onCreateTicket,
  onCreateLabel,
}: MainLayoutProps) {
  return (
    <div className="apple-layout-wrapper">
      <div className="apple-layout">
        <Header onCreateTicket={onCreateTicket} />
        <div className="apple-layout-body">
          <aside className="apple-sidebar-wrapper">
            <Sidebar
              selectedLabelIds={selectedLabelIds}
              onLabelSelect={onLabelSelect}
              onCreateLabel={onCreateLabel}
            />
          </aside>
          <main className="apple-content">
            <div className="apple-content-wrapper">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

