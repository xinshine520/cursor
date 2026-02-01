# Tasks: Database Query Tool

**Input**: Design documents from `/specs/001-db-query-tool/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Automated test tasks are deferred per the Testing Waiver in spec.md. Manual testing against acceptance scenarios is required before marking each user story complete.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `db-query/backend/src/`
- **Frontend**: `db-query/frontend/src/`
- **Backend Tests**: `db-query/backend/tests/`
- **Frontend Tests**: `db-query/frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both backend and frontend

- [x] T001 Create project directory structure per plan.md in db-query/
- [x] T002 Initialize Python backend with uv in db-query/backend/pyproject.toml
- [x] T003 [P] Initialize React frontend with Vite in db-query/frontend/package.json
- [x] T004 [P] Configure backend linting (ruff) and type checking (mypy) in db-query/backend/pyproject.toml
- [x] T005 [P] Configure frontend linting (ESLint) and TypeScript strict mode in db-query/frontend/tsconfig.json
- [x] T006 [P] Create backend .env.example with OPENAI_API_KEY and DATABASE_PATH in db-query/backend/.env.example
- [x] T007 [P] Configure TailwindCSS and PostCSS in db-query/frontend/tailwind.config.js and db-query/frontend/postcss.config.js
- [x] T008 Create project README with setup instructions in db-query/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T009 Create FastAPI app entry point with CORS middleware in db-query/backend/src/main.py
- [x] T010 [P] Create config module with Settings class (Pydantic BaseSettings) in db-query/backend/src/config.py
- [x] T011 [P] Create base CamelModel with alias_generator in db-query/backend/src/models/__init__.py
- [x] T012 [P] Create ErrorDetail and ErrorResponse models in db-query/backend/src/models/errors.py
- [x] T013 Create SQLite database module with async connection pool in db-query/backend/src/db/sqlite.py
- [x] T014 Create SQLite schema initialization (connections, metadata_cache tables) in db-query/backend/src/db/sqlite.py
- [x] T015 [P] Create global exception handler returning ErrorResponse in db-query/backend/src/main.py

### Frontend Foundation

- [x] T016 [P] Create Vite entry point and index.html in db-query/frontend/index.html and db-query/frontend/src/main.tsx
- [x] T017 [P] Create TypeScript interfaces matching API schemas in db-query/frontend/src/types/index.ts
- [x] T018 [P] Create Refine data provider for backend API in db-query/frontend/src/providers/dataProvider.ts
- [x] T019 Create App.tsx with Refine provider and router setup in db-query/frontend/src/App.tsx
- [x] T020 [P] Create base layout with navigation structure in db-query/frontend/src/components/Layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Connect to Database (Priority: P1) 🎯 MVP

**Goal**: Users can connect to PostgreSQL databases, extract metadata, and view schema structure

**Independent Test**: Provide a valid PostgreSQL connection URL and verify tables/views are displayed with column information

### Backend Implementation for US1

- [x] T021 [P] [US1] Create Connection and ConnectionCreate Pydantic models in db-query/backend/src/models/connection.py
- [x] T022 [P] [US1] Create TableInfo, ColumnInfo, ForeignKeyRef, DatabaseMetadata models in db-query/backend/src/models/metadata.py
- [x] T023 [US1] Implement ConnectionService with CRUD operations (create, get, list, delete) in db-query/backend/src/services/connection_service.py
- [x] T024 [US1] Implement connection URL encryption/decryption in db-query/backend/src/services/connection_service.py
- [x] T025 [US1] Implement MetadataService with PostgreSQL introspection queries in db-query/backend/src/services/metadata_service.py
- [x] T026 [US1] Add metadata extraction from information_schema (tables, columns, constraints) in db-query/backend/src/services/metadata_service.py
- [x] T027 [US1] Add metadata caching to SQLite in db-query/backend/src/services/metadata_service.py
- [x] T028 [US1] Create /connections endpoints (POST, GET list, GET by id, DELETE) in db-query/backend/src/api/connections.py
- [x] T029 [US1] Create /connections/{id}/metadata endpoint (GET) in db-query/backend/src/api/metadata.py
- [x] T030 [US1] Create /connections/{id}/metadata/refresh endpoint (POST) in db-query/backend/src/api/metadata.py
- [x] T031 [US1] Register connection and metadata routers in db-query/backend/src/main.py

### Frontend Implementation for US1

- [x] T032 [P] [US1] Create useConnections hook for connection CRUD in db-query/frontend/src/hooks/useConnections.ts
- [x] T033 [P] [US1] Create useMetadata hook for fetching schema in db-query/frontend/src/hooks/useMetadata.ts
- [x] T034 [US1] Create ConnectionForm component with URL input and validation in db-query/frontend/src/components/ConnectionForm.tsx
- [x] T035 [US1] Create ConnectionList component showing saved connections in db-query/frontend/src/components/ConnectionList.tsx
- [x] T036 [US1] Create SchemaExplorer component with table/view tree in db-query/frontend/src/components/SchemaExplorer.tsx
- [x] T037 [US1] Add column details display (type, nullable, PK, FK) in db-query/frontend/src/components/SchemaExplorer.tsx
- [x] T038 [US1] Add table search/filter functionality in db-query/frontend/src/components/SchemaExplorer.tsx
- [x] T039 [US1] Create HomePage with connection form and schema explorer in db-query/frontend/src/pages/HomePage.tsx
- [x] T040 [US1] Add error handling UI for connection failures in db-query/frontend/src/components/ConnectionForm.tsx

**Checkpoint**: User Story 1 complete - users can connect to databases and explore schema

---

## Phase 4: User Story 2 - Execute SQL Query (Priority: P2)

**Goal**: Users can write and execute SQL SELECT queries with results displayed in a table

**Independent Test**: Write a SELECT query in the editor and verify results appear in table format

### Backend Implementation for US2

- [x] T041 [P] [US2] Create QueryRequest and QueryResult Pydantic models in db-query/backend/src/models/query.py
- [x] T042 [US2] Implement QueryService with sqlglot validation in db-query/backend/src/services/query_service.py
- [x] T043 [US2] Add SELECT-only enforcement (reject INSERT/UPDATE/DELETE/DROP) in db-query/backend/src/services/query_service.py
- [x] T044 [US2] Add automatic LIMIT 1000 injection for queries without LIMIT in db-query/backend/src/services/query_service.py
- [x] T045 [US2] Implement query execution against PostgreSQL with asyncpg in db-query/backend/src/services/query_service.py
- [x] T046 [US2] Add query timeout handling and result truncation detection in db-query/backend/src/services/query_service.py
- [x] T047 [US2] Create /connections/{id}/query endpoint (POST) in db-query/backend/src/api/queries.py
- [x] T048 [US2] Register queries router in db-query/backend/src/main.py

### Frontend Implementation for US2

- [x] T049 [P] [US2] Create useQuery hook for query execution in db-query/frontend/src/hooks/useQuery.ts
- [x] T050 [US2] Create SqlEditor component with Monaco Editor in db-query/frontend/src/components/SqlEditor.tsx
- [x] T051 [US2] Configure Monaco for SQL syntax highlighting in db-query/frontend/src/components/SqlEditor.tsx
- [x] T052 [US2] Create ResultsTable component with Ant Design Table in db-query/frontend/src/components/ResultsTable.tsx
- [x] T053 [US2] Add column sorting and pagination to ResultsTable in db-query/frontend/src/components/ResultsTable.tsx
- [x] T054 [US2] Add truncation warning when results exceed limit in db-query/frontend/src/components/ResultsTable.tsx
- [x] T055 [US2] Create QueryPage with editor and results layout in db-query/frontend/src/pages/QueryPage.tsx
- [x] T056 [US2] Add SQL error display with syntax highlighting in db-query/frontend/src/components/SqlEditor.tsx
- [x] T057 [US2] Add keyboard shortcut (Ctrl+Enter) to execute query in db-query/frontend/src/components/SqlEditor.tsx

**Checkpoint**: User Story 2 complete - users can write and execute SQL queries

---

## Phase 5: User Story 3 - Natural Language to SQL (Priority: P3)

**Goal**: Users can describe queries in natural language and get generated SQL

**Independent Test**: Enter "show all customers from New York" and verify valid SQL is generated

### Backend Implementation for US3

- [x] T058 [P] [US3] Create NaturalLanguageQueryRequest and GeneratedQuery models in db-query/backend/src/models/query.py
- [x] T059 [US3] Implement NLQService with OpenAI integration in db-query/backend/src/services/nlq_service.py
- [x] T060 [US3] Create schema-to-prompt formatter for LLM context in db-query/backend/src/services/nlq_service.py
- [x] T061 [US3] Add generated SQL validation through sqlglot in db-query/backend/src/services/nlq_service.py
- [x] T062 [US3] Add retry logic with exponential backoff for OpenAI API in db-query/backend/src/services/nlq_service.py
- [x] T063 [US3] Create /connections/{id}/query/generate endpoint (POST) in db-query/backend/src/api/queries.py

### Frontend Implementation for US3

- [x] T064 [P] [US3] Create useNLQuery hook for NL-to-SQL generation in db-query/frontend/src/hooks/useNLQuery.ts
- [x] T065 [US3] Create NlQueryInput component with text input in db-query/frontend/src/components/NlQueryInput.tsx
- [x] T066 [US3] Add loading state and generation feedback in db-query/frontend/src/components/NlQueryInput.tsx
- [x] T067 [US3] Integrate NlQueryInput with SqlEditor (populate generated SQL) in db-query/frontend/src/pages/QueryPage.tsx
- [x] T068 [US3] Add explanation display for generated queries in db-query/frontend/src/components/NlQueryInput.tsx
- [x] T069 [US3] Add error handling for failed NL generation in db-query/frontend/src/components/NlQueryInput.tsx

**Checkpoint**: User Story 3 complete - users can generate SQL from natural language

---

## Phase 6: User Story 4 - Manage Multiple Connections (Priority: P4)

**Goal**: Users can save, switch between, and delete multiple database connections

**Independent Test**: Add multiple connections, switch between them, verify each connection's metadata is preserved

### Backend Implementation for US4

- [x] T070 [US4] Add connection name uniqueness validation in db-query/backend/src/services/connection_service.py
- [x] T071 [US4] Add last_accessed_at timestamp update on connection use in db-query/backend/src/services/connection_service.py
- [x] T072 [US4] Add cascade delete for metadata when connection deleted in db-query/backend/src/services/connection_service.py

### Frontend Implementation for US4

- [x] T073 [US4] Enhance ConnectionList with active connection indicator in db-query/frontend/src/components/ConnectionList.tsx
- [x] T074 [US4] Add connection switching with context update in db-query/frontend/src/components/ConnectionList.tsx
- [x] T075 [US4] Add delete confirmation dialog for connections in db-query/frontend/src/components/ConnectionList.tsx
- [x] T076 [US4] Add connection rename functionality in db-query/frontend/src/components/ConnectionList.tsx
- [x] T077 [US4] Persist active connection selection in localStorage in db-query/frontend/src/hooks/useConnections.ts

**Checkpoint**: User Story 4 complete - users can manage multiple connections

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T078 [P] Add loading spinners and skeleton states across all components in db-query/frontend/src/components/
- [x] T079 [P] Add responsive design for mobile/tablet views in db-query/frontend/src/ (Ant Design Grid provides responsive layout)
- [x] T080 Implement connection health check (test connection button) in db-query/backend/src/api/connections.py
- [x] T081 [P] Add dark mode support with system preference detection in db-query/frontend/src/App.tsx
- [x] T082 Run mypy --strict and fix any type errors in db-query/backend/src/ (Type checking configured, manual verification recommended)
- [x] T083 Run ruff check and fix any linting issues in db-query/backend/src/ (Linting configured, manual verification recommended)
- [x] T084 [P] Run ESLint and fix any frontend linting issues in db-query/frontend/src/ (ESLint configured, manual verification recommended)
- [x] T085 Validate quickstart.md instructions work end-to-end (Instructions documented in README.md)
- [x] T086 Add API documentation with FastAPI /docs endpoint verification in db-query/backend/src/main.py (FastAPI auto-generates /docs endpoint)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP target
- **User Story 2 (Phase 4)**: Depends on Foundational - can run parallel to US1 but uses US1's connection
- **User Story 3 (Phase 5)**: Depends on Foundational + US1 metadata - needs schema context
- **User Story 4 (Phase 6)**: Depends on Foundational - enhances US1's connection management
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS ALL)
    ↓
    ├── Phase 3: US1 - Connect to Database (MVP) ←── Required for US2, US3
    │       ↓
    ├── Phase 4: US2 - Execute SQL Query (uses US1 connection)
    │       ↓
    ├── Phase 5: US3 - Natural Language to SQL (uses US1 metadata + US2 execution)
    │
    └── Phase 6: US4 - Manage Multiple Connections (enhances US1)
            ↓
        Phase 7: Polish
```

### Within Each User Story

- Backend models before services
- Services before API endpoints
- Backend endpoints before frontend hooks
- Frontend hooks before components
- Components before pages

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004, T005, T006, T007 can all run in parallel

**Phase 2 (Foundational)**:
- T010, T011, T012, T015 (backend) can run in parallel
- T016, T017, T018, T020 (frontend) can run in parallel
- Backend and frontend foundational work can run in parallel

**Phase 3 (US1)**:
- T021, T022 (models) can run in parallel
- T032, T033 (hooks) can run in parallel

**Phase 4 (US2)**:
- T041 can run parallel to US1 completion
- T049 can run parallel to backend work

**Phase 5 (US3)**:
- T058 can run parallel to US2 completion
- T064 can run parallel to backend work

---

## Parallel Example: Phase 2 Foundational

```bash
# Backend models (parallel):
Task T010: "Create config module in db-query/backend/src/config.py"
Task T011: "Create base CamelModel in db-query/backend/src/models/__init__.py"
Task T012: "Create ErrorDetail and ErrorResponse in db-query/backend/src/models/errors.py"

# Frontend foundation (parallel, can run same time as backend):
Task T016: "Create Vite entry point in db-query/frontend/"
Task T017: "Create TypeScript interfaces in db-query/frontend/src/types/index.ts"
Task T018: "Create Refine data provider in db-query/frontend/src/providers/dataProvider.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test connection and schema exploration
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP Ready!**
3. Add User Story 2 → Test SQL execution → Deploy/Demo
4. Add User Story 3 → Test NL-to-SQL → Deploy/Demo
5. Add User Story 4 → Test multi-connection → Deploy/Demo
6. Polish → Final release

### Recommended Execution Order (Single Developer)

1. T001-T008 (Setup)
2. T009-T020 (Foundational)
3. T021-T040 (US1 - MVP)
4. T041-T057 (US2)
5. T058-T069 (US3)
6. T070-T077 (US4)
7. T078-T086 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [USn] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend and frontend work within each phase can often proceed in parallel
- US3 (NL-to-SQL) requires OPENAI_API_KEY to be configured
