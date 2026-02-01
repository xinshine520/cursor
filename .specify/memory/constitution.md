<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0
Bump rationale: Initial constitution creation (MAJOR - new governance document)

Modified principles: N/A (new document)
Added sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Development Workflow
  - Governance
Removed sections: N/A

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (compatible - no changes needed)
  - .specify/templates/spec-template.md ✅ (compatible - no changes needed)
  - .specify/templates/tasks-template.md ✅ (compatible - no changes needed)

Follow-up TODOs: None
==================
-->

# DB-Query Constitution

## Core Principles

### I. Type Safety First

All code MUST have strict type annotations. This is non-negotiable for both backend and frontend.

- **Backend (Python)**: All functions MUST have complete type hints using Python's typing module. Use `mypy --strict` or equivalent for validation.
- **Frontend (TypeScript)**: Enable `strict: true` in tsconfig.json. No `any` types except when interfacing with untyped external libraries (must be documented).
- **Data Models**: All data structures MUST be defined using Pydantic models (backend) or TypeScript interfaces (frontend).

**Rationale**: Type safety catches errors at development time, improves IDE support, and serves as living documentation.

### II. Ergonomic Python Style

Backend code MUST follow ergonomic Python conventions that prioritize readability and maintainability.

- **Pydantic Models**: All request/response schemas and domain entities MUST be Pydantic BaseModel subclasses.
- **Async-First**: Use `async/await` for all I/O operations (database queries, HTTP calls).
- **Explicit over Implicit**: Avoid magic; prefer explicit dependency injection over global state.
- **Naming**: Use `snake_case` for Python identifiers; JSON output MUST use `camelCase` (Pydantic's `alias_generator` or `model_config`).

**Rationale**: Ergonomic code reduces cognitive load and enables faster iteration.

### III. SQL Safety

All SQL operations MUST be validated and constrained to prevent misuse.

- **Parse Before Execute**: Every SQL query MUST be parsed by sqlglot before execution to validate syntax.
- **SELECT Only**: Only SELECT statements are permitted. INSERT, UPDATE, DELETE, DROP, and DDL statements MUST be rejected.
- **Default Limits**: Queries without a LIMIT clause MUST have `LIMIT 1000` automatically appended.
- **Error Clarity**: SQL parsing errors MUST return clear, actionable error messages to the user.

**Rationale**: This tool is for querying, not modifying data. Constraints protect users from accidental data changes.

### IV. API Contract Consistency

All API responses MUST follow consistent conventions.

- **JSON Format**: All API responses MUST be JSON with `camelCase` field names.
- **Error Schema**: Errors MUST follow a consistent structure: `{ "error": { "code": string, "message": string, "details"?: object } }`.
- **No Authentication**: The system operates without authentication. All endpoints are publicly accessible.
- **RESTful Design**: Use standard HTTP methods and status codes appropriately.

**Rationale**: Consistent APIs reduce frontend complexity and improve developer experience.

### V. Simplicity (YAGNI)

Build only what is specified. Avoid premature abstraction.

- **No Speculative Features**: Implement only requirements explicitly stated in specifications.
- **Minimal Dependencies**: Prefer standard library solutions; justify every external dependency.
- **Flat Structures**: Prefer simple functions over complex class hierarchies unless complexity is warranted.

**Rationale**: Unnecessary complexity increases maintenance burden and introduces potential failure points.

## Technology Stack

The following technologies are mandated for this project:

**Backend**:
- Python (managed via uv)
- FastAPI (web framework)
- Pydantic (data validation and serialization)
- sqlglot (SQL parsing and validation)
- OpenAI SDK (LLM integration for natural language to SQL)
- SQLite (metadata storage)
- PostgreSQL client (target database connections)

**Frontend**:
- React
- Refine 5 (data provider framework)
- Tailwind CSS (styling)
- Ant Design (UI components)
- Monaco Editor (SQL editor)
- TypeScript (strict mode)

## Development Workflow

### Code Quality Gates

1. **Type Checking**: All code MUST pass type checking before merge (mypy for Python, tsc for TypeScript).
2. **Linting**: Code MUST pass linting (ruff for Python, ESLint for TypeScript).
3. **Testing**: New features MUST include tests that verify acceptance criteria.

### Data Flow

1. User provides database connection string → System connects and extracts metadata
2. Metadata (tables, views, columns) → Processed by LLM → Stored as JSON in SQLite
3. User query (SQL or natural language) → Validated/Generated → Executed → JSON response
4. Frontend renders JSON as interactive table

## Governance

This constitution has the highest authority for the db-query project. It supersedes any conflicting guidance in session instructions or external documentation.

**Amendment Process**:
1. Proposed changes MUST be documented with rationale.
2. Changes MUST be reviewed for impact on existing code.
3. Version MUST be incremented according to semantic versioning.

**Compliance**:
- All code reviews MUST verify adherence to these principles.
- Violations MUST be justified in writing and approved before merge.

**Version**: 1.0.0 | **Ratified**: 2026-01-31 | **Last Amended**: 2026-01-31
