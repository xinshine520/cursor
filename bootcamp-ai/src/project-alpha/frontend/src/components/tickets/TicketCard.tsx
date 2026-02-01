import { memo, useMemo, useCallback } from 'react';
import { Card, Checkbox, Tag, Dropdown } from '../ui';
import { MoreIcon, EditIcon, DeleteIcon } from '../icons';
import type { Ticket } from '../../types/ticket';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import './TicketCard.less';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface TicketCardProps {
  ticket: Ticket;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}

const priorityConfig = {
  critical: { label: '紧急', color: '#ff3b30', bg: '#ffebee' },
  high: { label: '高', color: '#ff9500', bg: '#fff3e0' },
  medium: { label: '中', color: '#ffcc00', bg: '#fffde7' },
  low: { label: '低', color: '#34c759', bg: '#e8f5e9' },
} as const;

function formatDate(dateString: string): string {
  const date = dayjs(dateString);
  const now = dayjs();
  const diffMins = now.diff(date, 'minute');
  const diffHours = now.diff(date, 'hour');
  const diffDays = now.diff(date, 'day');

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.format('MM月DD日');
}

export const TicketCard = memo(function TicketCard({
  ticket,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
}: TicketCardProps) {
  const isCompleted = ticket.status === 'completed';
  const priority = priorityConfig[ticket.priority];

  const formattedDate = useMemo(() => formatDate(ticket.created_at), [ticket.created_at]);
  
  const truncatedDescription = useMemo(() => {
    if (!ticket.description) return null;
    return ticket.description.length > 100 
      ? `${ticket.description.substring(0, 100)}...` 
      : ticket.description;
  }, [ticket.description]);

  const handleEdit = useCallback(() => {
    onEdit(ticket);
  }, [onEdit, ticket]);

  const handleDelete = useCallback(() => {
    onDelete(ticket);
  }, [onDelete, ticket]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onComplete(ticket.id);
    } else {
      onReopen(ticket.id);
    }
  }, [onComplete, onReopen, ticket.id]);

  const menuItems = useMemo(() => [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditIcon />,
      onClick: handleEdit,
    },
    {
      divider: true,
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteIcon />,
      danger: true,
      onClick: handleDelete,
    },
  ], [handleEdit, handleDelete]);

  return (
    <Card
      className={`aliyun-ticket-card ${isCompleted ? 'aliyun-ticket-completed' : ''}`}
      hoverable
    >
      <div className="aliyun-ticket-content">
        <div className="aliyun-ticket-header">
          <h3
            className="aliyun-ticket-title"
            style={{
              opacity: isCompleted ? 0.6 : 1,
              textDecoration: isCompleted ? 'line-through' : 'none'
            }}
          >
            {ticket.title}
          </h3>
          <Tag color={priority.color} className="aliyun-priority-tag">
            {priority.label}
          </Tag>
        </div>

        {truncatedDescription && (
          <p
            className="aliyun-ticket-description"
            style={{ opacity: isCompleted ? 0.6 : 1 }}
          >
            {truncatedDescription}
          </p>
        )}

        <div className="aliyun-ticket-labels">
          {ticket.labels.map((label) => (
            <Tag
              key={label.id}
              color={label.color}
              className="aliyun-label-tag"
            >
              {label.name}
            </Tag>
          ))}
        </div>

        <div className="aliyun-ticket-footer">
          <span className="aliyun-ticket-time">
            {formattedDate}
          </span>
        </div>
      </div>
      <div className="aliyun-ticket-actions">
        <Checkbox
          checked={isCompleted}
          onChange={handleCheckboxChange}
          className="aliyun-ticket-checkbox"
        >
          <span className="aliyun-ticket-status">
            {isCompleted ? '已完成' : '进行中'}
          </span>
        </Checkbox>
        <Dropdown items={menuItems} trigger={['click']} placement="bottomRight">
          <button
            className="aliyun-ticket-more"
            type="button"
          >
            <MoreIcon />
          </button>
        </Dropdown>
      </div>
    </Card>
  );
});
