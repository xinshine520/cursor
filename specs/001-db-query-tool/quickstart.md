# Quickstart: Database Query Tool

**Feature**: 001-db-query-tool  
**Date**: 2026-01-31

## Prerequisites

- Python 3.11+ with uv package manager
- Node.js 18+ with npm
- PostgreSQL database to connect to (for testing)
- OpenAI API key (for natural language to SQL feature)

## Project Setup

### 1. Clone and Navigate

```bash
cd db-query
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment and install dependencies
uv sync

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd db-query/backend
uv run uvicorn src.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Start Frontend (Terminal 2)

```bash
cd db-query/frontend
npm run dev
```

The UI will be available at `http://localhost:5173`

## First Use Walkthrough

### 1. Add a Database Connection

1. Open `http://localhost:5173` in your browser
2. Click "Add Connection"
3. Enter a name (e.g., "My Local DB")
4. Enter your PostgreSQL connection URL:
   ```
   postgresql://username:password@localhost:5432/database_name
   ```
5. Click "Connect"

The system will connect to your database and extract metadata (tables, views, columns).

### 2. Explore Database Schema

After connecting, you'll see:
- List of tables and views in the left sidebar
- Click any table to see its columns, types, and constraints
- Use the search box to filter tables by name

### 3. Execute a SQL Query

1. Click on the SQL Editor tab
2. Write a SELECT query, for example:
   ```sql
   SELECT * FROM users WHERE created_at > '2024-01-01'
   ```
3. Click "Run" or press Ctrl+Enter
4. Results appear in the table below

**Note**: Only SELECT queries are allowed. The system automatically adds `LIMIT 1000` if you don't specify a limit.

### 4. Generate SQL from Natural Language

1. Click on the "Ask" tab
2. Type a question in plain English:
   ```
   Show me all orders from the last 30 days with total amount over 100
   ```
3. Click "Generate"
4. Review the generated SQL in the editor
5. Modify if needed, then click "Run"

## API Quick Reference

### Create Connection
```bash
curl -X POST http://localhost:8000/connections \
  -H "Content-Type: application/json" \
  -d '{"name": "My DB", "connectionUrl": "postgresql://user:pass@localhost:5432/db"}'
```

### List Connections
```bash
curl http://localhost:8000/connections
```

### Get Metadata
```bash
curl http://localhost:8000/connections/{connectionId}/metadata
```

### Execute Query
```bash
curl -X POST http://localhost:8000/connections/{connectionId}/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM users LIMIT 10"}'
```

### Generate SQL from Natural Language
```bash
curl -X POST http://localhost:8000/connections/{connectionId}/query/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Show all active users"}'
```

## Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for NL-to-SQL | Required |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4` |
| `DATABASE_PATH` | SQLite database path | `./data/db-query.sqlite` |
| `QUERY_TIMEOUT` | Query timeout in seconds | `30` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Testing

### Backend Tests

```bash
cd db-query/backend

# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src

# Run specific test file
uv run pytest tests/unit/test_query_service.py
```

### Frontend Tests

```bash
cd db-query/frontend

# Run all tests
npm test

# Run with watch mode
npm run test:watch
```

## Troubleshooting

### Connection Failed

- Verify the PostgreSQL server is running
- Check the connection URL format: `postgresql://user:password@host:port/database`
- Ensure network access to the database server
- Check that the user has permission to access the database

### Query Timeout

- Add a more restrictive WHERE clause
- Add or reduce the LIMIT clause
- Check database server performance

### Natural Language Query Failed

- Ensure OPENAI_API_KEY is set correctly
- Check that the database has metadata extracted
- Try rephrasing the question with more specific table/column names

### Monaco Editor Not Loading

- Clear browser cache
- Check browser console for errors
- Ensure JavaScript is enabled

## Development Tips

### Hot Reload

Both backend (uvicorn --reload) and frontend (Vite) support hot reload. Changes to source files will automatically refresh.

### API Documentation

FastAPI provides automatic API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Type Checking

```bash
# Backend
cd backend && uv run mypy src

# Frontend
cd frontend && npm run typecheck
```

### Linting

```bash
# Backend
cd backend && uv run ruff check src

# Frontend
cd frontend && npm run lint
```
