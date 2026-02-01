import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="w-full overflow-auto">
        <table 
          ref={ref} 
          className={cn(
            'w-full caption-bottom text-sm border-collapse',
            'border border-gray-200 dark:border-gray-700',
            className
          )} 
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead 
        ref={ref} 
        className={cn(
          '[&_tr]:border-b border-gray-200 dark:border-gray-700',
          className
        )} 
        {...props} 
      />
    );
  }
);

TableHeader.displayName = 'TableHeader';

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
    );
  }
);

TableBody.displayName = 'TableBody';

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=selected]:bg-gray-100 dark:data-[state=selected]:bg-gray-800',
          className
        )}
        {...props}
      />
    );
  }
);

TableRow.displayName = 'TableRow';

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400',
          'border-r border-gray-200 dark:border-gray-700 last:border-r-0',
          '[&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          'p-4 align-middle',
          'border-r border-gray-200 dark:border-gray-700 last:border-r-0',
          '[&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      />
    );
  }
);

TableCell.displayName = 'TableCell';
