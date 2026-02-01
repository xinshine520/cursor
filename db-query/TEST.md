# Testing Guide

## Prerequisites

1. **Python 3.11+** with `uv` installed
2. **Node.js 18+** with `npm`
3. **PostgreSQL database** for testing (or use a test database)
4. **OpenAI API key** (optional, only needed for NL-to-SQL feature)

## Quick Test Setup

### 1. Backend Setup

```bash
cd db-query/backend

# Install dependencies
uv sync

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key (optional for MVP testing)
# OPENAI_API_KEY=sk-your-key-here
```

### 2. Frontend Setup

```bash
cd db-query/frontend

# Install dependencies
npm install
```

### 3. Start Backend Server

```bash
cd db-query/backend
uv run uvicorn src.main:app --reload --port 8000
```

The backend should start at `http://localhost:8000`
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 4. Start Frontend Server

In a new terminal:

```bash
cd db-query/frontend
npm run dev
```

The frontend should start at `http://localhost:5173`

## Manual Testing Checklist

### Backend API Tests

1. **Health Check**
   ```bash
   curl http://localhost:8000/health
   ```
   Expected: `{"status":"ok"}`

2. **Create Connection**
   ```bash
   curl -X POST http://localhost:8000/connections \
     -H "Content-Type: application/json" \
     -d '{"name":"Test DB","connectionUrl":"postgresql://user:pass@localhost:5432/testdb"}'
   ```
   Expected: Connection object with id, name, createdAt

3. **List Connections**
   ```bash
   curl http://localhost:8000/connections
   ```
   Expected: Array of connection objects

4. **Get Metadata** (replace {id} with actual connection ID)
   ```bash
   curl http://localhost:8000/connections/{id}/metadata
   ```
   Expected: DatabaseMetadata with tables array

### Frontend UI Tests

1. **Open Application**
   - Navigate to http://localhost:5173
   - Should see "Database Query Tool" header

2. **Add Connection**
   - Fill in connection form:
     - Name: "My Test Database"
     - URL: `postgresql://user:password@host:port/database`
   - Click "Connect"
   - Should see success message
   - Connection should appear in list

3. **View Schema**
   - Click on a connection in the list
   - Should see tables and views in Schema Explorer
   - Click on a table to see column details

4. **Search Tables**
   - Type in search box
   - Table list should filter

5. **Refresh Metadata**
   - Click "Refresh" button
   - Metadata should reload

6. **Delete Connection**
   - Click delete button on a connection
   - Confirm deletion
   - Connection should be removed

## Expected Behavior

### ✅ Success Indicators

- Backend starts without errors
- Frontend compiles without TypeScript errors
- Can create connections successfully
- Metadata extraction works (tables/views appear)
- Schema explorer displays correctly
- Search/filter works
- Delete connection works

### ⚠️ Common Issues

1. **Backend won't start**
   - Check Python version: `python --version` (should be 3.11+)
   - Check if port 8000 is available
   - Verify dependencies installed: `uv sync`

2. **Frontend won't start**
   - Check Node.js version: `node --version` (should be 18+)
   - Check if port 5173 is available
   - Verify dependencies: `npm install`

3. **Connection fails**
   - Verify PostgreSQL URL format: `postgresql://user:password@host:port/database`
   - Check database is accessible
   - Check network connectivity

4. **Metadata not showing**
   - Check backend logs for errors
   - Try refresh button
   - Verify database has tables/views in public schema

## Type Checking

### Backend
```bash
cd db-query/backend
uv run mypy src
```

### Frontend
```bash
cd db-query/frontend
npm run typecheck
```

## Linting

### Backend
```bash
cd db-query/backend
uv run ruff check src
```

### Frontend
```bash
cd db-query/frontend
npm run lint
```
