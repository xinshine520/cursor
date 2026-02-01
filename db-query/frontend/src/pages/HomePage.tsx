import { useEffect } from 'react';
import { useConnections } from '../hooks/useConnections';
import { useConnectionStore } from '../stores/connectionStore';
import { useTranslation } from '../hooks/useTranslation';
import { ConnectionForm } from '../components/features/ConnectionForm';
import { ConnectionList } from '../components/features/ConnectionList';
import { SchemaExplorer } from '../components/features/SchemaExplorer';

export function HomePage() {
  const { data: connections = [], isLoading } = useConnections();
  const { activeConnectionId, setActiveConnectionId } = useConnectionStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (connections.length > 0 && !activeConnectionId) {
      setActiveConnectionId(connections[0].id);
    }
  }, [connections, activeConnectionId, setActiveConnectionId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.connections.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.connections.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t.nav.connections}</h2>
              {connections.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {connections.length} {connections.length === 1 ? 'connection' : 'connections'}
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <ConnectionList connections={connections} />
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">{t.schema.title}</h2>
          <SchemaExplorer connectionId={activeConnectionId} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{t.connections.addConnection}</h2>
        <ConnectionForm />
      </div>
    </div>
  );
}
