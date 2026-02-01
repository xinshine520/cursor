# Database Query Tool

A web-based database query tool that allows users to connect to PostgreSQL databases, explore schema metadata, execute SQL queries via a code editor, and generate SQL from natural language using AI.

## Features

- **Database Connection Management**: Connect to PostgreSQL databases and save connections locally
- **Schema Exploration**: View tables, views, columns, and constraints in an organized interface
- **SQL Query Editor**: Write and execute SELECT queries with syntax highlighting (Monaco Editor)
- **Natural Language to SQL**: Generate SQL queries from plain English descriptions using AI
- **Query Safety**: All queries are validated (SELECT-only) and automatically limited to 1000 rows

## Prerequisites

- Python 3.11+ with [uv](https://github.com/astral-sh/uv) package manager
- Node.js 18+ with npm
- PostgreSQL database to connect to (for testing)
- OpenAI API key (for natural language to SQL feature)

## Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Create .env file from example
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
uv run uvicorn src.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
db-query/
├── backend/          # Python FastAPI backend
│   ├── src/
│   │   ├── models/   # Pydantic models
│   │   ├── services/ # Business logic
│   │   ├── api/      # FastAPI routes
│   │   └── db/       # SQLite storage
│   └── tests/        # Test files
│
└── frontend/         # React TypeScript frontend
    ├── src/
    │   ├── components/ # React components
    │   ├── pages/      # Page components
    │   ├── hooks/      # Custom hooks
    │   └── providers/  # Context providers
    └── ...
```

## Technology Stack

**Backend:**
- Python 3.11+
- FastAPI (web framework)
- Pydantic (data validation)
- sqlglot (SQL parsing)
- OpenAI SDK (LLM integration)
- asyncpg (PostgreSQL client)
- aiosqlite (SQLite client)

**Frontend:**
- React 18
- TypeScript (strict mode)
- Refine 5 (data provider)
- Ant Design 5 (UI components)
- Monaco Editor (SQL editor)
- TailwindCSS (styling)

## Development

### Type Checking

```bash
# Backend
cd backend
uv run mypy src

# Frontend
cd frontend
npm run typecheck
```

### Linting

```bash
# Backend
cd backend
uv run ruff check src

# Frontend
cd frontend
npm run lint
```

## License

MIT
