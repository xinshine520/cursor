import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { exportToExcel, exportToWord } from '../../utils/export';
import type { QueryResult } from '../../types';

interface ResultsTableProps {
  result: QueryResult | null;
  loading?: boolean;
}

export function ResultsTable({ result, loading }: ResultsTableProps) {
  const { t } = useTranslation();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportError, setExportError] = useState<string | null>(null);
  const pageSize = 50;

  if (!result) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
          {t.query.noResults}
        </CardContent>
      </Card>
    );
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRows = [...result.rows].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const handleExportExcel = () => {
    setExportError(null);
    try {
      if (!result || !result.rows || result.rows.length === 0) {
        setExportError(t.query.exportNoData);
        return;
      }
      // 导出所有数据（不分页）
      exportToExcel(result.columns, result.rows);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : t.errors.unknownError);
    }
  };

  const handleExportWord = async () => {
    setExportError(null);
    try {
      if (!result || !result.rows || result.rows.length === 0) {
        setExportError(t.query.exportNoData);
        return;
      }
      // 导出所有数据（不分页）
      await exportToWord(result.columns, result.rows);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : t.errors.unknownError);
    }
  };

  return (
    <Card data-testid="results-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t.query.results}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
              {result.rowCount} {t.query.rows}
            </span>
            <span className="text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
              {result.durationMs}ms
            </span>
            <div className="flex items-center gap-2 ml-2 border-l border-gray-200 dark:border-gray-700 pl-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportExcel}
                disabled={!result || result.rows.length === 0}
                title={t.query.exportExcel}
              >
                {t.query.exportExcel}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportWord}
                disabled={!result || result.rows.length === 0}
                title={t.query.exportWord}
              >
                {t.query.exportWord}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {exportError && (
          <Alert variant="error" className="mb-4">
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}
        {result.truncated && (
          <Alert variant="warning" className="mb-4">
            <AlertDescription>
              {t.query.truncatedMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {result.columns.map((col) => (
                  <TableHead
                    key={col}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-2">
                      {col}
                      {sortColumn === col && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={result.columns.length} className="text-center py-8">
                    {t.common.loading}
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={result.columns.length} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t.query.noResults}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row, idx) => (
                  <TableRow key={idx}>
                    {result.columns.map((col) => (
                      <TableCell
                        key={col}
                        className={cn(
                          row[col] === null || row[col] === undefined
                            ? 'text-gray-400 italic'
                            : ''
                        )}
                      >
                        {formatValue(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.query.showing} {(currentPage - 1) * pageSize + 1} {t.query.to}{' '}
              {Math.min(currentPage * pageSize, sortedRows.length)} {t.query.of} {sortedRows.length} {t.query.rows}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t.query.previous}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t.query.next}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
