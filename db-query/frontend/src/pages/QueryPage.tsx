import { useState, useEffect } from 'react';
import { useConnections } from '../hooks/useConnections';
import { useConnectionStore } from '../stores/connectionStore';
import { useTranslation } from '../hooks/useTranslation';
import { useExecuteQuery } from '../hooks/useQuery';
import { useGenerateQuery } from '../hooks/useNLQuery';
import { SqlEditor } from '../components/features/SqlEditor';
import { ResultsTable } from '../components/features/ResultsTable';
import { NlQueryInput } from '../components/features/NlQueryInput';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function QueryPage() {
  const { data: connections = [] } = useConnections();
  const { activeConnectionId, setActiveConnectionId } = useConnectionStore();
  const { t } = useTranslation();
  const [sql, setSql] = useState('SELECT * FROM ');
  const [generatedQuery, setGeneratedQuery] = useState<{ sql: string; explanation: string } | null>(null);
  const [nlqError, setNlqError] = useState<string | null>(null);
  const [executeError, setExecuteError] = useState<string | null>(null);

  const executeMutation = useExecuteQuery(activeConnectionId);
  const generateMutation = useGenerateQuery(activeConnectionId);

  useEffect(() => {
    if (connections.length > 0 && !activeConnectionId) {
      setActiveConnectionId(connections[0].id);
    }
  }, [connections, activeConnectionId, setActiveConnectionId]);

  const handleExecute = () => {
    setExecuteError(null);

    // 验证：检查连接是否已选择
    if (!activeConnectionId) {
      setExecuteError(t.errors.noConnectionSelected);
      return;
    }

    // 验证：检查SQL是否为空
    const trimmedSql = sql.trim();
    if (!trimmedSql) {
      setExecuteError(t.errors.queryRequired);
      return;
    }

    // 验证：检查SQL是否只包含SELECT语句（安全验证）
    const sqlUpper = trimmedSql.toUpperCase();
    
    // 检查是否以SELECT或WITH开头（CTE也是安全的）
    const isSelectQuery = sqlUpper.startsWith('SELECT') || sqlUpper.startsWith('WITH');
    
    if (!isSelectQuery) {
      setExecuteError(t.errors.onlySelectAllowed);
      return;
    }

    // 检查是否包含危险关键字（在非注释部分）
    const forbiddenKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];
    const lines = trimmedSql.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // 跳过注释行
      if (trimmedLine.startsWith('--') || trimmedLine.startsWith('/*')) {
        continue;
      }
      
      const lineUpper = trimmedLine.toUpperCase();
      // 检查是否包含危险关键字
      for (const keyword of forbiddenKeywords) {
        // 检查关键字是否在SQL中（排除在字符串字面量中的情况）
        if (lineUpper.includes(keyword)) {
          // 简单检查：如果包含SELECT，可能是SELECT ... FROM ... WHERE ... 中的正常使用
          // 但如果单独出现危险关键字，则拒绝
          if (!lineUpper.includes('SELECT') && !lineUpper.startsWith('--')) {
            setExecuteError(t.errors.dangerousKeywordDetected.replace('{keyword}', keyword));
            return;
          }
        }
      }
    }

    // 所有验证通过，执行查询
    executeMutation.mutate(trimmedSql, {
      onError: (err: Error) => {
        setExecuteError(err.message || t.errors.unknownError);
      },
    });
  };

  const handleGenerate = (query: string) => {
    setNlqError(null);
    generateMutation.mutate(query, {
      onSuccess: (data) => {
        setGeneratedQuery(data);
      },
      onError: (err: Error) => {
        const errorMsg = err.message || t.errors.generateFailed;
        // Check for specific error types
        if (errorMsg.includes('cannot be empty') || errorMsg.includes('empty')) {
          setNlqError(t.errors.queryEmpty);
        } else if (errorMsg.includes('validation') || errorMsg.includes('VALIDATION')) {
          setNlqError(t.errors.validationError + ': ' + errorMsg);
        } else if (errorMsg.includes('authentication') || errorMsg.includes('api_key') || errorMsg.includes('OPENAI_AUTH')) {
          setNlqError(t.errors.openaiAuthError + ': ' + errorMsg);
        } else if (errorMsg.includes('OpenAI') || errorMsg.includes('OPENAI')) {
          setNlqError(t.errors.openaiApiError + ': ' + errorMsg);
        } else {
          setNlqError(errorMsg);
        }
      },
    });
  };

  const handleClearNLQ = () => {
    setGeneratedQuery(null);
    setNlqError(null);
  };

  const handleUseQuery = (generatedSql: string) => {
    setSql(generatedSql);
    setGeneratedQuery(null);
    setNlqError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.query.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.query.subtitle}</p>
      </div>

      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label 
                htmlFor="connection-select" 
                className="font-medium h-10 flex items-center"
              >
                {t.query.connection}:
              </label>
              <Select
                id="connection-select"
                value={activeConnectionId || ''}
                onChange={(e) => setActiveConnectionId(e.target.value || null)}
                className="w-64"
              >
                <option value="">{t.query.selectConnection}</option>
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              onClick={handleExecute}
              disabled={!activeConnectionId || !sql.trim() || executeMutation.isPending}
            >
              {executeMutation.isPending ? t.query.executing : t.query.execute}
            </Button>
          </div>
        </CardContent>
      </Card>

      <NlQueryInput
        onGenerate={handleGenerate}
        generatedQuery={generatedQuery}
        loading={generateMutation.isPending}
        error={nlqError}
        onClear={handleClearNLQ}
        onUseQuery={handleUseQuery}
      />

      <SqlEditor
        value={sql}
        onChange={(value) => {
          setSql(value);
          // 清除错误提示当用户开始编辑时
          if (executeError) {
            setExecuteError(null);
          }
        }}
        onExecute={handleExecute}
        error={
          executeError ||
          (executeMutation.error
            ? executeMutation.error.message || t.errors.unknownError
            : null)
        }
        loading={executeMutation.isPending}
      />

      <ResultsTable
        result={executeMutation.data || null}
        loading={executeMutation.isPending}
      />
    </div>
  );
}
