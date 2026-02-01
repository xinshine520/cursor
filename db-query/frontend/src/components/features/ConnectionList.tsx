import { useState } from 'react';
import { useUpdateConnection, useDeleteConnection } from '../../hooks/useConnections';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';
import type { Connection } from '../../types';

interface ConnectionListProps {
  connections: Connection[];
}

export function ConnectionList({ connections }: ConnectionListProps) {
  const { activeConnectionId, setActiveConnectionId } = useConnectionStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { t } = useTranslation();
  
  const updateMutation = useUpdateConnection();
  const deleteMutation = useDeleteConnection();

  const handleStartEdit = (connection: Connection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(connection.id);
    setEditName(connection.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      return;
    }
    updateMutation.mutate(
      { id, data: { name: editName.trim() } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName('');
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`${t.connections.deleteConfirm}\n${t.connections.deleteMessage}`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (activeConnectionId === id) {
            setActiveConnectionId(null);
          }
        },
      });
    }
  };

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400">
          {t.connections.noConnections}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3" data-testid="connection-list">
      {connections.map((connection) => {
        const isSelected = activeConnectionId === connection.id;
        const isEditing = editingId === connection.id;

        return (
          <Card
            key={connection.id}
            className={cn(
              'cursor-pointer transition-all duration-200',
              isSelected
                ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                : 'border hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm'
            )}
            onClick={() => !isEditing && setActiveConnectionId(connection.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(connection.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(connection.id);
                        }}
                      >
                        ✓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <h3 className={cn('font-semibold text-base', isSelected && 'text-blue-700 dark:text-blue-300')}>
                          {connection.name}
                        </h3>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded font-medium',
                          connection.databaseType === 'mysql'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        )}>
                          {connection.databaseType === 'mysql' ? 'MySQL' : 'PostgreSQL'}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                            {t.connections.active}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                        <div>{t.connections.created}: {new Date(connection.createdAt).toLocaleString()}</div>
                        {connection.lastAccessedAt && (
                          <div>
                            {t.connections.lastAccessed}: {new Date(connection.lastAccessedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleStartEdit(connection, e)}
                    >
                      {t.connections.rename}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => handleDelete(connection.id, e)}
                    >
                      {t.common.delete}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
