import { memo, useMemo, useCallback } from 'react';
import { Button } from '../ui/Button';
import { PlusIcon } from '../icons';
import { useLabels } from '../../hooks/useLabels';
import './Sidebar.less';

interface SidebarProps {
  selectedLabelIds: string[];
  onLabelSelect: (labelId: string | null) => void;
  onCreateLabel: () => void;
}

export const Sidebar = memo(function Sidebar({
  selectedLabelIds,
  onLabelSelect,
  onCreateLabel,
}: SidebarProps) {
  const { data: labelsData } = useLabels();
  const labels = useMemo(() => labelsData?.data || [], [labelsData?.data]);

  const totalTickets = useMemo(() => 
    labels.reduce((sum, l) => sum + (l.ticket_count || 0), 0),
    [labels]
  );

  const isSelected = useCallback((key: string) => {
    if (key === 'all') {
      return selectedLabelIds.length === 0;
    }
    return selectedLabelIds.includes(key);
  }, [selectedLabelIds]);

  const handleAllClick = useCallback(() => {
    onLabelSelect(null);
  }, [onLabelSelect]);

  const handleLabelClick = useCallback((labelId: string) => {
    onLabelSelect(labelId);
  }, [onLabelSelect]);

  return (
    <aside className="apple-sidebar">
      <div className="apple-sidebar-menu">
        <div
          className={`apple-menu-item ${isSelected('all') ? 'apple-menu-item-selected' : ''}`}
          onClick={handleAllClick}
        >
          <div className="apple-menu-item-content">
            <span className="apple-menu-item-text">全部</span>
            <span className="apple-menu-item-count">({totalTickets})</span>
          </div>
        </div>
        <div className="apple-menu-divider" />
        {labels.map((label) => (
          <div
            key={label.id}
            className={`apple-menu-item ${isSelected(label.id) ? 'apple-menu-item-selected' : ''}`}
            onClick={() => handleLabelClick(label.id)}
          >
            <div className="apple-menu-item-content">
              <div
                className="apple-label-dot"
                style={{ backgroundColor: label.color }}
              />
              <span className="apple-menu-item-text">{label.name}</span>
              <span className="apple-menu-item-count">
                {label.ticket_count || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="apple-sidebar-footer">
        <Button
          variant="secondary"
          icon={<PlusIcon />}
          onClick={onCreateLabel}
          className="apple-sidebar-create-btn"
          size="medium"
        >
          新建标签
        </Button>
      </div>
    </aside>
  );
});

