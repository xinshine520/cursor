import { Drawer, Menu, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useLabels } from '../../hooks/useLabels';
import type { MenuProps } from 'antd';
import './MobileMenu.less';

const { Text } = Typography;

interface MobileMenuProps {
  selectedLabelIds: string[];
  onLabelSelect: (labelId: string | null) => void;
  onCreateLabel: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({
  selectedLabelIds,
  onLabelSelect,
  onCreateLabel,
  isOpen,
  onClose,
}: MobileMenuProps) {
  const { data: labelsData } = useLabels();
  const labels = labelsData?.data || [];
  const totalTickets = labels.reduce((sum, l) => sum + (l.ticket_count || 0), 0);

  const selectedKeys = selectedLabelIds.length > 0 ? selectedLabelIds : ['all'];

  const menuItems: MenuProps['items'] = [
    {
      key: 'all',
      label: (
        <div className="apple-menu-item-content">
          <Text className="apple-menu-item-text">全部</Text>
          <Text type="secondary" className="apple-menu-item-count">({totalTickets})</Text>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    ...labels.map((label) => ({
      key: label.id,
      label: (
        <div className="apple-menu-item-content">
          <div
            className="apple-label-dot"
            style={{ backgroundColor: label.color }}
          />
          <Text className="apple-menu-item-text">{label.name}</Text>
          <Text type="secondary" className="apple-menu-item-count">
            {label.ticket_count || 0}
          </Text>
        </div>
      ),
    })),
  ];

  return (
    <Drawer
      title="筛选"
      placement="left"
      onClose={onClose}
      open={isOpen}
      className="apple-mobile-drawer"
      width={280}
      styles={{
        mask: {
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
        onClick={({ key }) => {
          if (key === 'all') {
            onLabelSelect(null);
          } else {
            onLabelSelect(key as string);
          }
          onClose();
        }}
        className="apple-sidebar-menu"
      />
      <div className="apple-sidebar-footer">
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={() => {
            onCreateLabel();
            onClose();
          }}
          className="apple-sidebar-create-btn"
          block
        >
          新建标签
        </Button>
      </div>
    </Drawer>
  );
}

