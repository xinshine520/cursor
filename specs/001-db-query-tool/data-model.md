# Data Model: Database Query Tool

**Feature**: 001-db-query-tool  
**Date**: 2026-01-31

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│   Connection    │──1:1──│  DatabaseMetadata   │
└─────────────────┘       └─────────────────────┘
        │                          │
        │                          │ 1:N
        │                          ▼
        │                 ┌─────────────────┐
        │                 │   TableInfo     │
        │                 └─────────────────┘
        │                          │
        │                          │ 1:N
        │                          ▼
        │                 ┌─────────────────┐
        │                 │   ColumnInfo    │
        │                 └─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│   QueryHistory  │
└─────────────────┘
```

## Entities

### Connection

Represents a saved database connection configuration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| name | string | Required, max 100 chars | User-provided display name |
| connection_url | string | Required, encrypted | PostgreSQL connection URL |
| created_at | datetime | Auto-set on create | Creation timestamp (UTC) |
| last_accessed_at | datetime | Nullable, auto-update | Last successful connection (UTC) |

**Validation Rules**:
- `name` must be non-empty and unique
- `connection_url` must match PostgreSQL URL pattern: `postgresql://...`

**State Transitions**: None (simple CRUD)

---

### DatabaseMetadata

Represents the extracted schema information for a connection.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| connection_id | UUID | FK → Connection, unique | Associated connection |
| tables | TableInfo[] | Embedded JSON | List of tables and views |
| extracted_at | datetime | Auto-set | When metadata was extracted (UTC) |

**Validation Rules**:
- One metadata record per connection (upsert on refresh)
- `tables` array can be empty for databases with no public tables

**State Transitions**: 
- Created on first successful connection
- Replaced entirely on metadata refresh

---

### TableInfo

Represents a database table or view (embedded in DatabaseMetadata).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| name | string | Required | Table or view name |
| type | enum | "table" \| "view" | Object type |
| columns | ColumnInfo[] | Required | List of columns |
| row_count_estimate | integer | Nullable | Approximate row count |

**Validation Rules**:
- `name` must be valid PostgreSQL identifier
- `columns` must have at least one entry

---

### ColumnInfo

Represents a column in a table or view (embedded in TableInfo).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| name | string | Required | Column name |
| data_type | string | Required | PostgreSQL data type |
| is_nullable | boolean | Required | Whether column allows NULL |
| is_primary_key | boolean | Required | Whether column is part of PK |
| foreign_key | ForeignKeyRef \| null | Nullable | FK reference if applicable |
| default_value | string \| null | Nullable | Default value expression |

---

### ForeignKeyRef

Represents a foreign key reference (embedded in ColumnInfo).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| table | string | Required | Referenced table name |
| column | string | Required | Referenced column name |

---

### QueryHistory

Represents a historical query execution (optional, for future enhancement).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| connection_id | UUID | FK → Connection | Associated connection |
| sql | string | Required | Executed SQL query |
| source | enum | "manual" \| "generated" | How query was created |
| natural_language | string \| null | Nullable | Original NL prompt if generated |
| executed_at | datetime | Auto-set | Execution timestamp (UTC) |
| duration_ms | integer | Required | Execution time in milliseconds |
| row_count | integer | Required | Number of rows returned |
| error | string \| null | Nullable | Error message if failed |

**Note**: QueryHistory is optional for MVP. Include only if time permits.

---

## Pydantic Models (Backend)

```python
from datetime import datetime
from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

def to_camel(string: str) -> str:
    components = string.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

class TableType(str, Enum):
    TABLE = "table"
    VIEW = "view"

class QuerySource(str, Enum):
    MANUAL = "manual"
    GENERATED = "generated"

class ForeignKeyRef(CamelModel):
    table: str
    column: str

class ColumnInfo(CamelModel):
    name: str
    data_type: str = Field(alias="dataType")
    is_nullable: bool = Field(alias="isNullable")
    is_primary_key: bool = Field(alias="isPrimaryKey")
    foreign_key: ForeignKeyRef | None = Field(default=None, alias="foreignKey")
    default_value: str | None = Field(default=None, alias="defaultValue")

class TableInfo(CamelModel):
    name: str
    type: TableType
    columns: list[ColumnInfo]
    row_count_estimate: int | None = Field(default=None, alias="rowCountEstimate")

class DatabaseMetadata(CamelModel):
    id: UUID
    connection_id: UUID = Field(alias="connectionId")
    tables: list[TableInfo]
    extracted_at: datetime = Field(alias="extractedAt")

class Connection(CamelModel):
    id: UUID
    name: str
    created_at: datetime = Field(alias="createdAt")
    last_accessed_at: datetime | None = Field(default=None, alias="lastAccessedAt")
    # Note: connection_url excluded from response for security

class ConnectionCreate(CamelModel):
    name: str = Field(min_length=1, max_length=100)
    connection_url: str = Field(alias="connectionUrl", pattern=r"^postgresql://.*")

class QueryRequest(CamelModel):
    sql: str = Field(min_length=1)

class NaturalLanguageQueryRequest(CamelModel):
    prompt: str = Field(min_length=1, max_length=1000)

class QueryResult(CamelModel):
    columns: list[str]
    rows: list[dict]
    row_count: int = Field(alias="rowCount")
    truncated: bool
    duration_ms: int = Field(alias="durationMs")

class GeneratedQuery(CamelModel):
    sql: str
    explanation: str | None = None
```

---

## TypeScript Interfaces (Frontend)

```typescript
// types/index.ts

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

export interface Connection {
  id: string;
  name: string;
  createdAt: string; // ISO datetime
  lastAccessedAt: string | null;
}

export interface ConnectionCreate {
  name: string;
  connectionUrl: string;
}

export interface QueryRequest {
  sql: string;
}

export interface NaturalLanguageQueryRequest {
  prompt: string;
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
  explanation: string | null;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: ErrorDetail;
}
```

---

## SQLite Schema (Local Storage)

```sql
-- Connections table
CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    connection_url_encrypted TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_accessed_at TEXT
);

-- Metadata cache table
CREATE TABLE IF NOT EXISTS metadata_cache (
    id TEXT PRIMARY KEY,
    connection_id TEXT NOT NULL UNIQUE REFERENCES connections(id) ON DELETE CASCADE,
    tables_json TEXT NOT NULL,
    extracted_at TEXT NOT NULL
);

-- Index for connection lookup
CREATE INDEX IF NOT EXISTS idx_metadata_connection ON metadata_cache(connection_id);
```
