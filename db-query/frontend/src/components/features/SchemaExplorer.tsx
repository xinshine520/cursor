import { useState } from 'react';
import { useMetadata, useRefreshMetadata } from '../../hooks/useMetadata';
import { useTranslation } from '../../hooks/useTranslation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { cn } from '../../utils/cn';
import type { TableInfo } from '../../types';

interface SchemaExplorerProps {
  connectionId: string | null;
}

export function SchemaExplorer({ connectionId }: SchemaExplorerProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  const { data: metadata, isLoading, error } = useMetadata(connectionId);
  const refreshMutation = useRefreshMetadata();

  const filteredTables = metadata?.tables.filter((table) =>
    table.name.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
    const table = filteredTables.find((t) => t.name === tableName);
    if (table) {
      setSelectedTable(table);
    }
  };

  const handleRefresh = () => {
    if (connectionId) {
      refreshMutation.mutate(connectionId);
    }
  };

  if (!connectionId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
          {t.connections.selectConnection}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="error">
            <AlertDescription>
              {error instanceof Error ? error.message : t.errors.unknownError}
            </AlertDescription>
          </Alert>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            className="mt-4"
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? t.schema.refreshing : t.common.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="schema-explorer">
      <div className="flex gap-2">
        <Input
          placeholder={t.schema.searchTables}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1"
          data-testid="schema-search-input"
        />
        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
        >
          {refreshMutation.isPending ? t.schema.refreshing : t.common.refresh}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t.schema.tablesAndViews} ({filteredTables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {filteredTables.map((table) => {
                const isExpanded = expandedTables.has(table.name);
                const isSelected = selectedTable?.name === table.name;

                return (
                  <div key={table.name}>
                    <button
                      onClick={() => toggleTable(table.name)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md transition-colors',
                        isSelected
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-100'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{table.name}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded',
                              table.type === 'table'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            )}
                          >
                            {table.type === 'table' ? t.schema.table : t.schema.view}
                          </span>
                          {table.rowCountEstimate !== null && (
                            <span className="text-xs text-gray-500">
                              ~{table.rowCountEstimate.toLocaleString()} {t.schema.rows}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {table.columns.map((column) => (
                          <div
                            key={column.name}
                            className="px-3 py-1 text-sm text-gray-600 flex items-center gap-2"
                          >
                            <span className="font-mono">{column.name}</span>
                            <span className="text-gray-400">•</span>
                            <span>{column.dataType}</span>
                            {column.isPrimaryKey && (
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                {t.schema.primaryKey}
                              </span>
                            )}
                            {column.isNullable ? (
                              <span className="text-xs text-gray-500">{t.schema.nullable}</span>
                            ) : (
                              <span className="text-xs text-blue-600">{t.schema.notNull}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedTable && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTable.name} ({selectedTable.type})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.schema.column}</TableHead>
                    <TableHead>{t.schema.type}</TableHead>
                    <TableHead>{t.schema.constraints}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTable.columns.map((column) => (
                    <TableRow key={column.name}>
                      <TableCell className="font-mono">{column.name}</TableCell>
                      <TableCell>{column.dataType}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {column.isPrimaryKey && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              {t.schema.primaryKey}
                            </span>
                          )}
                          {column.isNullable ? (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {t.schema.nullable}
                            </span>
                          ) : (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {t.schema.notNull}
                            </span>
                          )}
                          {column.foreignKey && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              {t.schema.foreignKey} → {column.foreignKey.table}.{column.foreignKey.column}
                            </span>
                          )}
                          {column.defaultValue && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {t.schema.defaultValue}: {column.defaultValue}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
