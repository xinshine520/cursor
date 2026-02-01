import { useState, useRef, useEffect, ReactNode, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Dropdown.less';

interface DropdownItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
  divider?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  trigger?: ('click' | 'hover')[];
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function Dropdown({ 
  items, 
  trigger = ['click'], 
  placement = 'bottomRight', 
  children, 
  className = '',
  'aria-label': ariaLabel = '更多操作'
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const menuId = useId();
  const triggerId = useId();

  const validItems = items.filter(item => !item.divider);
  
  // 计算菜单位置
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    
    // 根据 placement 调整位置
    if (placement === 'bottomRight') {
      left = rect.right - 160; // 160 是菜单最小宽度
    } else if (placement === 'topLeft') {
      top = rect.top - 8;
    } else if (placement === 'topRight') {
      top = rect.top - 8;
      left = rect.right - 160;
    }
    
    setMenuPosition({ top, left });
  }, [placement]);

  // 打开菜单时计算位置
  useEffect(() => {
    if (isOpen) {
      updateMenuPosition();
      // 监听滚动和窗口大小变化
      window.addEventListener('scroll', updateMenuPosition, true);
      window.addEventListener('resize', updateMenuPosition);
      
      return () => {
        window.removeEventListener('scroll', updateMenuPosition, true);
        window.removeEventListener('resize', updateMenuPosition);
      };
    }
  }, [isOpen, updateMenuPosition]);
  
  useEffect(() => {
    if (!isOpen || !trigger.includes('click')) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // 检查点击是否在触发器或菜单外部
      if (
        triggerRef.current && 
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    // 延迟注册事件监听器
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, { capture: true });
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside, { capture: true });
    };
  }, [isOpen, trigger]);

  // 暂时禁用菜单自动聚焦，避免触发重新渲染
  // useEffect(() => {
  //   if (isOpen && menuRef.current) {
  //     menuRef.current.focus();
  //   }
  // }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        dropdownRef.current?.querySelector<HTMLElement>('[role="button"]')?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < validItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : validItems.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && validItems[focusedIndex]) {
          handleItemClick(validItems[focusedIndex]);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(validItems.length - 1);
        break;
    }
  }, [isOpen, focusedIndex, validItems]);

  // 暂时禁用自动聚焦，避免重新渲染导致闪烁
  // useEffect(() => {
  //   if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
  //     itemRefs.current[focusedIndex]?.focus();
  //   }
  // }, [focusedIndex]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (trigger.includes('click')) {
      e.preventDefault();
      e.stopPropagation();
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      setFocusedIndex(-1);
      
      if (newIsOpen) {
        // 立即计算位置
        requestAnimationFrame(() => {
          updateMenuPosition();
        });
      }
    }
  }, [trigger, isOpen, updateMenuPosition]);

  const handleItemClick = useCallback((item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  // 渲染菜单
  const renderMenu = () => {
    if (!isOpen) return null;
    
    const menu = (
      <div 
        ref={menuRef}
        id={menuId}
        className="apple-dropdown-menu apple-dropdown-portal"
        style={{
          position: 'fixed',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          zIndex: 10001,
        }}
        role="menu"
        aria-labelledby={triggerId}
        tabIndex={-1}
      >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div 
                  key={`divider-${index}`} 
                  className="apple-dropdown-divider" 
                  role="separator"
                  aria-orientation="horizontal"
                />
              );
            }
            const itemIndex = validItems.findIndex(i => i.key === item.key);
            return (
              <div
                key={item.key}
                ref={el => itemRefs.current[itemIndex] = el}
                className={`apple-dropdown-item ${item.danger ? 'apple-dropdown-item-danger' : ''}`}
                role="menuitem"
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleItemClick(item);
                }}
                aria-label={typeof item.label === 'string' ? item.label : undefined}
              >
                {item.icon && <span className="apple-dropdown-icon" aria-hidden="true">{item.icon}</span>}
                <span className="apple-dropdown-label">{item.label}</span>
              </div>
            );
          })}
      </div>
    );
    
    // 使用 Portal 将菜单渲染到 body
    return createPortal(menu, document.body);
  };

  return (
    <div
      ref={dropdownRef}
      className={`apple-dropdown ${className}`}
      onKeyDown={handleKeyDown}
    >
      <div 
        ref={triggerRef}
        className="apple-dropdown-trigger"
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={ariaLabel}
        onClick={handleClick}
        id={triggerId}
      >
        {children}
      </div>
      {renderMenu()}
    </div>
  );
}

