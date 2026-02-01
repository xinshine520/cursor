import { memo, useMemo } from 'react';
import { Button } from '../ui/Button';
import { PlusIcon } from '../icons';
import './Header.less';

interface HeaderProps {
  onCreateTicket: () => void;
}

export const Header = memo(function Header({ onCreateTicket }: HeaderProps) {
  const logoStyle = useMemo(() => ({ 
    fontSize: 18, 
    color: '#ffffff', 
    fontWeight: 600 
  }), []);

  return (
    <header className="aliyun-header">
      <div className="aliyun-header-content">
        <div className="aliyun-header-left">
          <div className="aliyun-header-logo">
            <div className="aliyun-logo-icon">
              <span style={logoStyle}>T</span>
            </div>
            <span className="aliyun-header-title">Ticket Management System V1.2</span>
          </div>
        </div>

        <div className="aliyun-header-right">
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={onCreateTicket}
            className="aliyun-header-create-btn"
            size="lg"
          >
            新建 Ticket
          </Button>
        </div>
      </div>
    </header>
  );
});

