import { memo, useCallback } from 'react';
import { Input } from '../ui/Input';
import { SearchIcon } from '../icons';
import './TicketSearch.less';

interface TicketSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const TicketSearch = memo(function TicketSearch({ value, onChange }: TicketSearchProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <Input
      type="search"
      placeholder="搜索 Ticket..."
      value={value}
      onChange={handleChange}
      size="large"
      className="apple-search-input"
      prefix={<SearchIcon />}
    />
  );
});

