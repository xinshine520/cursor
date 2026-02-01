import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { cn } from '../../utils/cn';
import type { GeneratedQuery } from '../../types';

interface NlQueryInputProps {
  onGenerate: (query: string) => void;
  generatedQuery: GeneratedQuery | null;
  loading: boolean;
  error: string | null;
  onClear: () => void;
  onUseQuery: (sql: string) => void;
}

export function NlQueryInput({
  onGenerate,
  generatedQuery,
  loading,
  error,
  onClear,
  onUseQuery,
}: NlQueryInputProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const handleGenerate = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      // Don't call onGenerate if query is empty
      return;
    }
    onGenerate(trimmedQuery);
  };

  const handleUseQuery = () => {
    if (generatedQuery) {
      onUseQuery(generatedQuery.sql);
      setQuery('');
      onClear();
    }
  };

  return (
    <Card data-testid="nlq-input">
      <CardHeader>
        <CardTitle>{t.nlq.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={t.nlq.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          disabled={loading}
          data-testid="nlq-textarea"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!query.trim() || loading}
          >
            {loading ? t.nlq.generating : t.nlq.generate}
          </Button>
          {(generatedQuery || error) && (
            <Button variant="ghost" onClick={onClear}>
              {t.nlq.clear}
            </Button>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t.nlq.generating}</p>
          </div>
        )}

        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedQuery && (
          <Card className="bg-gray-50 dark:bg-gray-800">
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t.nlq.generatedSql}:</h4>
                <pre className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto text-sm font-mono">
                  {generatedQuery.sql}
                </pre>
              </div>

              {generatedQuery.explanation && (
                <div>
                  <h4 className="font-semibold mb-2">{t.nlq.explanation}:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{generatedQuery.explanation}</p>
                </div>
              )}

              <Button onClick={handleUseQuery} className="w-full">
                {t.nlq.useQuery}
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
