# Implementation Plan: Database Query Tool

**Branch**: `001-db-query-tool` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-db-query-tool/spec.md`

## Summary

Build a web-based database query tool that allows users to connect to PostgreSQL databases, explore schema metadata, execute SQL queries via a code editor, and generate SQL from natural language using AI. The system persists connection details and metadata locally in SQLite, validates all queries with sqlglot (SELECT-only), and displays results in interactive tables.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend)  
**Primary Dependencies**:
- Backend: FastAPI, Pydantic, sqlglot, openai, asyncpg, aiosqlite
- Frontend: React 18, Refine 5, Ant Design 5, Monaco Editor, TailwindCSS  
**Storage**: SQLite (local metadata/connections), PostgreSQL (target databases)  
**Testing**: pytest + pytest-asyncio (backend), Vitest + React Testing Library (frontend)  
**Target Platform**: Web browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- Metadata extraction < 30s
- Query results < 5s for 1000 rows
- NL-to-SQL generation < 10s  
**Constraints**: 
- SELECT queries only
- Max 1000 rows per query
- No authentication required  
**Scale/Scope**: Single-user local tool, databases with up to 500 tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Type Safety First | All code has strict type annotations | ✅ Pass | Python: mypy --strict, TypeScript: strict: true |
| I. Type Safety First | Pydantic models for backend data | ✅ Pass | All entities defined as Pydantic models |
| I. Type Safety First | TypeScript interfaces for frontend | ✅ Pass | All API responses typed |
| II. Ergonomic Python | Async-first I/O | ✅ Pass | asyncpg, aiosqlite for all DB operations |
| II. Ergonomic Python | snake_case Python, camelCase JSON | ✅ Pass | Pydantic alias_generator configured |
| II. Ergonomic Python | Explicit dependency injection | ✅ Pass | FastAPI Depends() for all services |
| III. SQL Safety | Parse before execute (sqlglot) | ✅ Pass | All queries validated before execution |
| III. SQL Safety | SELECT only | ✅ Pass | Non-SELECT rejected at parse time |
| III. SQL Safety | Default LIMIT 1000 | ✅ Pass | Auto-appended if missing |
| IV. API Contract | JSON with camelCase | ✅ Pass | Pydantic model_config |
| IV. API Contract | Consistent error schema | ✅ Pass | ErrorResponse model defined |
| IV. API Contract | No authentication | ✅ Pass | All endpoints public |
| V. Simplicity | No speculative features | ✅ Pass | Only spec requirements implemented |
| V. Simplicity | Minimal dependencies | ✅ Pass | All deps justified in research.md |

**Gate Result**: ✅ PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-db-query-tool/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
db-query/
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings and configuration
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py    # Connection Pydantic models
│   │   │   ├── metadata.py      # DatabaseMetadata, Table, Column models
│   │   │   ├── query.py         # Query request/response models
│   │   │   └── errors.py        # Error response models
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── connection_service.py   # Connection CRUD operations
│   │   │   ├── metadata_service.py     # Metadata extraction from PostgreSQL
│   │   │   ├── query_service.py        # SQL validation and execution
│   │   │   └── nlq_service.py          # Natural language to SQL (OpenAI)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── connections.py   # /connections endpoints
│   │   │   ├── metadata.py      # /metadata endpoints
│   │   │   └── queries.py       # /queries endpoints
│   │   └── db/
│   │       ├── __init__.py
│   │       └── sqlite.py        # SQLite connection pool for local storage
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── unit/
│   │   │   ├── test_query_service.py
│   │   │   └── test_metadata_service.py
│   │   └── integration/
│   │       └── test_api.py
│   ├── pyproject.toml
│   └── .python-version
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── vite-env.d.ts
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces matching API
│   │   ├── components/
│   │   │   ├── ConnectionForm.tsx
│   │   │   ├── ConnectionList.tsx
│   │   │   ├── SchemaExplorer.tsx
│   │   │   ├── SqlEditor.tsx
│   │   │   ├── NlQueryInput.tsx
│   │   │   └── ResultsTable.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── QueryPage.tsx
│   │   ├── providers/
│   │   │   └── dataProvider.ts  # Refine data provider for API
│   │   └── hooks/
│   │       ├── useConnections.ts
│   │       ├── useMetadata.ts
│   │       └── useQuery.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

**Structure Decision**: Web application structure selected (Option 2) because the feature requires both a Python backend (FastAPI for API, sqlglot for SQL parsing, OpenAI for NL-to-SQL) and a React frontend (Monaco Editor, interactive tables). Backend and frontend are separate deployable units with clear API contracts.

## Complexity Tracking

> No constitution violations requiring justification. All design decisions align with principles.
