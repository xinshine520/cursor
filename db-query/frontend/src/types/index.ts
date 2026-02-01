// TypeScript interfaces matching API schemas

export type TableType = 'table' | 'view';
export type QuerySource = 'manual' | 'generated';

export interface ForeignKeyRef {
  table: string;
  column: string;
}

export interface ColumnInfo {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  foreignKey: ForeignKeyRef | null;
  defaultValue: string | null;
}

export interface TableInfo {
  name: string;
  type: TableType;
  columns: ColumnInfo[];
  rowCountEstimate: number | null;
}

export interface DatabaseMetadata {
  id: string;
  connectionId: string;
  tables: TableInfo[];
  extractedAt: string; // ISO datetime
}

export type DatabaseType = 'postgresql' | 'mysql';

export interface Connection {
  id: string;
  name: string;
  databaseType: DatabaseType;
  createdAt: string; // ISO datetime
  lastAccessedAt: string | null;
}

export interface ConnectionCreate {
  name: string;
  connectionUrl: string;
}

export interface ConnectionUpdate {
  name: string;
}

export interface QueryRequest {
  sql: string;
}

export interface NaturalLanguageQueryRequest {
  query: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
  durationMs: number;
}

export interface GeneratedQuery {
  sql: string;
  explanation: string;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: ErrorDetail;
}
