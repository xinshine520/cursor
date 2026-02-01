import { useState } from 'react';
import { useCreateConnection } from '../../hooks/useConnections';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { cn } from '../../utils/cn';
import type { DatabaseType } from '../../types';

interface ConnectionFormProps {
  onSuccess?: () => void;
}

export function ConnectionForm({ onSuccess }: ConnectionFormProps) {
  const [name, setName] = useState('');
  const [databaseType, setDatabaseType] = useState<DatabaseType>('postgresql');
  const [connectionUrl, setConnectionUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const createMutation = useCreateConnection();

  // Get URL placeholder based on database type
  const getUrlPlaceholder = (type: DatabaseType): string => {
    if (type === 'mysql') {
      return 'mysql://user:password@localhost:3306/mydb';
    }
    return 'postgresql://user:password@localhost:5432/mydb';
  };

  // Get URL format hint based on database type
  const getUrlFormat = (type: DatabaseType): string => {
    if (type === 'mysql') {
      return t.connections.urlFormatMysql;
    }
    return t.connections.urlFormatPostgres;
  };

  // Validate URL based on database type
  const validateUrl = (url: string, type: DatabaseType): boolean => {
    if (type === 'mysql') {
      return url.startsWith('mysql://') || url.startsWith('mysql+pymysql://');
    }
    return url.startsWith('postgresql://') || url.startsWith('postgres://');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t.errors.nameRequired);
      return;
    }

    if (!connectionUrl.trim()) {
      setError(t.errors.urlRequired);
      return;
    }

    // Validate URL format based on selected database type
    const url = connectionUrl.trim();
    if (!validateUrl(url, databaseType)) {
      setError(t.errors.invalidUrl);
      return;
    }

    createMutation.mutate(
      { name: name.trim(), connectionUrl: connectionUrl.trim() },
      {
        onSuccess: () => {
          setName('');
          setConnectionUrl('');
          setDatabaseType('postgresql');
          onSuccess?.();
        },
        onError: (err: Error) => {
          setError(err.message || t.errors.connectionFailed);
        },
      }
    );
  };

  return (
    <Card className="max-w-2xl mx-auto" data-testid="connection-form">
      <CardHeader>
        <CardTitle>{t.connections.addConnection}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.connections.connectionName}
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Local Database"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="databaseType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.connections.databaseType}
            </label>
            <Select
              id="databaseType"
              value={databaseType}
              onChange={(e) => {
                const newType = e.target.value as DatabaseType;
                setDatabaseType(newType);
                // Update placeholder URL when type changes
                setConnectionUrl('');
              }}
            >
              <option value="postgresql">{t.connections.databaseTypePostgresql}</option>
              <option value="mysql">{t.connections.databaseTypeMysql}</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.connections.connectionUrl}
            </label>
            <Input
              id="url"
              type="text"
              value={connectionUrl}
              onChange={(e) => setConnectionUrl(e.target.value)}
              placeholder={getUrlPlaceholder(databaseType)}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getUrlFormat(databaseType)}
            </p>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? t.connections.connecting : t.connections.connect}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
