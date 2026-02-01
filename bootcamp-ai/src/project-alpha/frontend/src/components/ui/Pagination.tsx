import './Pagination.less';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  className?: string;
}

export function Pagination({
  current,
  total,
  pageSize,
  onChange,
  showQuickJumper,
  showTotal,
  className = '',
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`apple-pagination ${className}`}>
      {showTotal && (
        <div className="apple-pagination-total">
          {showTotal(total, [start, end])}
        </div>
      )}
      <div className="apple-pagination-pages">
        <button
          className="apple-pagination-prev"
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7 2L3 6L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="apple-pagination-ellipsis">
                ...
              </span>
            );
          }
          return (
            <button
              key={page}
              className={`apple-pagination-item ${current === page ? 'apple-pagination-item-active' : ''}`}
              onClick={() => onChange(page as number)}
            >
              {page}
            </button>
          );
        })}
        <button
          className="apple-pagination-next"
          disabled={current === totalPages}
          onClick={() => onChange(current + 1)}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M5 2L9 6L5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

