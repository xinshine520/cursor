# Research: Database Query Tool

**Feature**: 001-db-query-tool  
**Date**: 2026-01-31

## Technology Decisions

### 1. PostgreSQL Client Library

**Decision**: asyncpg

**Rationale**: 
- Native async support aligns with Constitution Principle II (Async-First)
- High performance with binary protocol
- Direct access to PostgreSQL system catalogs for metadata extraction
- Well-maintained with active community

**Alternatives Considered**:
- `psycopg3`: Good async support but slower than asyncpg for read-heavy workloads
- `databases`: Abstraction layer adds unnecessary complexity (violates Principle V)

---

### 2. Local Storage (SQLite)

**Decision**: aiosqlite

**Rationale**:
- Async wrapper for sqlite3, maintains async-first architecture
- SQLite is sufficient for local metadata caching (single-user tool)
- No external database server required
- Pydantic models serialize cleanly to JSON columns

**Alternatives Considered**:
- `sqlalchemy[asyncio]`: Overkill for simple key-value style storage
- File-based JSON: Lacks query capabilities for connection management

---

### 3. SQL Parsing and Validation

**Decision**: sqlglot

**Rationale**:
- Constitution mandates sqlglot for SQL parsing (Principle III)
- Supports PostgreSQL dialect
- Can detect statement type (SELECT vs INSERT/UPDATE/DELETE)
- Can modify AST to inject LIMIT clause
- No external dependencies

**Implementation Notes**:
```python
import sqlglot

def validate_and_transform(sql: str) -> str:
    parsed = sqlglot.parse_one(sql, dialect="postgres")
    
    # Reject non-SELECT
    if not isinstance(parsed, sqlglot.exp.Select):
        raise ValueError("Only SELECT statements are allowed")
    
    # Add LIMIT if missing
    if parsed.args.get("limit") is None:
        parsed = parsed.limit(1000)
    
    return parsed.sql(dialect="postgres")
```

---

### 4. Natural Language to SQL

**Decision**: OpenAI GPT-4 via openai SDK

**Rationale**:
- Constitution specifies OpenAI SDK
- GPT-4 has strong SQL generation capabilities
- Schema context can be provided in system prompt
- Streaming not required (simple request/response)

**Implementation Pattern**:
- System prompt includes database schema (tables, columns, types)
- User prompt is the natural language query
- Response is validated through sqlglot before execution
- Temperature set low (0.1) for deterministic SQL generation

**Alternatives Considered**:
- Local LLM (Ollama): Higher latency, less accurate for SQL
- Claude: Excellent but constitution specifies OpenAI

---

### 5. Frontend Framework

**Decision**: React 18 + Refine 5 + Ant Design 5

**Rationale**:
- Constitution mandates this stack
- Refine provides data provider abstraction for REST APIs
- Ant Design offers production-ready table components with sorting/filtering
- TypeScript strict mode for type safety

---

### 6. SQL Editor

**Decision**: Monaco Editor (@monaco-editor/react)

**Rationale**:
- Constitution mandates Monaco Editor
- SQL syntax highlighting out of the box
- Familiar VS Code editing experience
- Good TypeScript support

**Configuration**:
- Language: `sql`
- Theme: Light/dark based on system preference
- Options: Line numbers, minimap disabled, word wrap

---

### 7. PostgreSQL Metadata Extraction

**Decision**: Query PostgreSQL information_schema and pg_catalog

**Rationale**:
- Standard approach for PostgreSQL introspection
- No additional dependencies required
- Returns all required metadata (tables, views, columns, types, constraints)

**Key Queries**:

```sql
-- Tables and Views
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = $1;

-- Primary Keys
SELECT kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY';

-- Foreign Keys
SELECT kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY';
```

---

### 8. API Design Pattern

**Decision**: RESTful with resource-based URLs

**Rationale**:
- Constitution requires RESTful design (Principle IV)
- Simple CRUD operations map naturally to REST
- Stateless design simplifies implementation

**Endpoints**:
- `POST /connections` - Create connection
- `GET /connections` - List connections
- `GET /connections/{id}` - Get connection
- `DELETE /connections/{id}` - Delete connection
- `GET /connections/{id}/metadata` - Get cached metadata
- `POST /connections/{id}/metadata/refresh` - Re-extract metadata
- `POST /connections/{id}/query` - Execute SQL query
- `POST /connections/{id}/query/generate` - Generate SQL from natural language

---

### 9. Error Handling

**Decision**: Consistent error response model

**Rationale**:
- Constitution requires consistent error schema (Principle IV)
- All errors return same structure for frontend simplicity

**Schema**:
```python
class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None

class ErrorResponse(BaseModel):
    error: ErrorDetail
```

**Error Codes**:
- `CONNECTION_FAILED`: Database connection error
- `INVALID_SQL`: SQL syntax error
- `FORBIDDEN_STATEMENT`: Non-SELECT statement
- `QUERY_TIMEOUT`: Query exceeded time limit
- `NLQ_FAILED`: Natural language query generation failed
- `NOT_FOUND`: Resource not found

---

### 10. Connection String Security

**Decision**: Store encrypted in SQLite, decrypt at runtime

**Rationale**:
- Connection strings contain passwords
- Local encryption provides basic protection
- Key derived from machine-specific identifier

**Implementation**:
- Use `cryptography.fernet` for symmetric encryption
- Key derived from combination of username and machine ID
- Decryption happens only when connection is used

**Note**: This is basic protection for a local tool. For production multi-user deployment, proper secrets management would be required.

---

## Dependency Justification

| Dependency | Purpose | Alternatives Rejected |
|------------|---------|----------------------|
| fastapi | Web framework | Flask (no async), Django (too heavy) |
| pydantic | Data validation | dataclasses (no validation), attrs (less features) |
| asyncpg | PostgreSQL client | psycopg3 (slower), databases (abstraction overhead) |
| aiosqlite | SQLite async | sqlite3 (blocking) |
| sqlglot | SQL parsing | sqlparse (no AST modification) |
| openai | LLM integration | Required by constitution |
| uvicorn | ASGI server | hypercorn (less common) |
| react | UI framework | Required by constitution |
| @refinedev/core | Data provider | Required by constitution |
| antd | UI components | Required by constitution |
| @monaco-editor/react | Code editor | Required by constitution |
| tailwindcss | Styling | Required by constitution |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| OpenAI API rate limits | Implement retry with exponential backoff |
| Large schema overwhelming LLM context | Summarize schema, include only relevant tables |
| Connection string exposure | Local encryption, warn users about security |
| Query timeout on slow databases | Configurable timeout, cancel query on timeout |
| Monaco Editor bundle size | Lazy load editor component |
