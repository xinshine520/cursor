import { useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { cn } from '../../utils/cn';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  error: string | null;
  loading?: boolean;
}

// 计算编辑器高度：每行约 20px，加上一些边距
const LINE_HEIGHT = 20;
const MIN_HEIGHT = 200; // 最小高度 200px
const MAX_HEIGHT = 800; // 最大高度 800px
const PADDING = 40; // 上下边距

export function SqlEditor({ value, onChange, onExecute, error, loading }: SqlEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<any>(null);
  
  // 根据 SQL 内容计算编辑器高度
  const editorHeight = useMemo(() => {
    if (!value) {
      return MIN_HEIGHT;
    }
    
    // 计算行数
    const lines = value.split('\n').length;
    // 计算高度：行数 * 行高 + 边距
    const calculatedHeight = lines * LINE_HEIGHT + PADDING;
    
    // 限制在最小和最大高度之间
    return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, calculatedHeight));
  }, [value]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    if (monaco) {
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          onExecute();
        }
      );
    }
  };

  // 当内容变化时，更新编辑器布局
  useEffect(() => {
    if (editorRef.current) {
      // 延迟一下确保内容已更新
      setTimeout(() => {
        editorRef.current?.layout();
      }, 0);
    }
  }, [value, editorHeight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onExecute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExecute]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{t.query.title}</CardTitle>
        <span className="text-xs text-gray-500 dark:text-gray-400">{t.query.pressToExecute}</span>
      </CardHeader>
      <CardContent className="flex flex-col">
        {error && (
          <Alert variant="error" className="mb-4">
            <AlertDescription className="break-words">{error}</AlertDescription>
          </Alert>
        )}
        <div 
          className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden" 
          data-testid="sql-editor-container"
          style={{ height: `${editorHeight}px` }}
        >
          <Editor
            height={`${editorHeight}px`}
            defaultLanguage="sql"
            value={value}
            onChange={(val) => onChange(val || '')}
            onMount={(editor, monaco) => handleEditorDidMount(editor, monaco)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
              },
              theme: 'vs',
            }}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
