# Testing Guide - Database Query Tool

This guide will help you test all features of the Database Query Tool application.

## Prerequisites Check

Before testing, ensure you have:

- ✅ Python 3.11+ installed
- ✅ Node.js 18+ installed  
- ✅ uv package manager installed (`pip install uv`)
- ✅ PostgreSQL database available for testing
- ⚠️ OpenAI API key (optional - only needed for Natural Language to SQL feature)

## Quick Setup

### Option 1: Automated Setup Script

```powershell
cd db-query
.\test-setup.ps1
```

### Option 2: Manual Setup

**Backend:**
```powershell
cd db-query/backend
uv sync
Copy-Item .env.example .env
# Edit .env and add OPENAI_API_KEY if you want NL-to-SQL features
```

**Frontend:**
```powershell
cd db-query/frontend
npm install
```

## Starting the Application

### Terminal 1 - Backend Server

```powershell
cd db-query/backend
uv run uvicorn src.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Terminal 2 - Frontend Dev Server

```powershell
cd db-query/frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Testing Checklist

### ✅ Phase 1: Backend API Testing

#### 1.1 Health Check
Open browser: http://localhost:8000/docs

You should see the FastAPI interactive documentation (Swagger UI).

#### 1.2 Test Connection Endpoints

**List Connections (should be empty initially):**
```powershell
curl http://localhost:8000/connections
```

**Create a Connection:**
```powershell
$body = @{
    name = "Test Database"
    connectionUrl = "postgresql://user:password@localhost:5432/dbname"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/connections" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Replace `user`, `password`, `localhost`, `5432`, and `dbname` with your actual PostgreSQL credentials.

**Get Connection:**
```powershell
# Use the connection ID from the create response
Invoke-RestMethod -Uri "http://localhost:8000/connections/{connection-id}"
```

**Test Connection Health:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/connections/{connection-id}/test" `
    -Method POST
```

**Get Metadata:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/connections/{connection-id}/metadata"
```

### ✅ Phase 2: Frontend UI Testing

#### 2.1 Open Frontend
Navigate to: http://localhost:5173

#### 2.2 Test Connection Management

1. **Add Connection**
   - Click "Add New Connection"
   - Enter connection name
   - Enter PostgreSQL connection URL: `postgresql://user:password@host:port/database`
   - Click "Create Connection"
   - ✅ Verify connection appears in the list
   - ✅ Verify schema is automatically extracted

2. **View Schema**
   - Select a connection from the list
   - ✅ Verify tables and views appear in Schema Explorer
   - ✅ Verify you can expand tables to see columns
   - ✅ Verify column details show (data types, nullable, primary keys, foreign keys)

3. **Rename Connection**
   - Click "Rename" button on a connection
   - Enter new name
   - Press Enter or click checkmark
   - ✅ Verify name updates

4. **Delete Connection**
   - Click "Delete" button
   - Confirm deletion
   - ✅ Verify connection is removed
   - ✅ Verify metadata is also deleted (cascade)

#### 2.3 Test SQL Query Execution

1. **Navigate to Query Page**
   - Click "Query" in navigation

2. **Select Connection**
   - Select a connection from dropdown
   - ✅ Verify connection is selected

3. **Write SQL Query**
   - Enter a SELECT query in the editor, e.g.:
     ```sql
     SELECT * FROM users LIMIT 10;
     ```
   - ✅ Verify syntax highlighting works
   - ✅ Verify Ctrl+Enter executes query

4. **Execute Query**
   - Click "Execute Query" button or press Ctrl+Enter
   - ✅ Verify results appear in table
   - ✅ Verify columns are sortable
   - ✅ Verify pagination works
   - ✅ Verify row count and execution time display

5. **Test Query Validation**
   - Try executing: `INSERT INTO users VALUES (1, 'test');`
   - ✅ Verify error: "Only SELECT statements are allowed"
   
   - Try executing: `SELECT * FROM users` (without LIMIT)
   - ✅ Verify LIMIT 1000 is automatically added
   - ✅ Verify truncation warning appears

6. **Test Error Handling**
   - Execute invalid SQL: `SELECT * FROM nonexistent_table;`
   - ✅ Verify clear error message appears
   - ✅ Verify error is displayed in red alert

#### 2.4 Test Natural Language to SQL (Optional - Requires OpenAI API Key)

1. **Configure OpenAI API Key**
   - Edit `backend/.env`
   - Set `OPENAI_API_KEY=sk-your-actual-key`

2. **Restart Backend Server**
   - Stop backend (Ctrl+C)
   - Start again: `uv run uvicorn src.main:app --reload --port 8000`

3. **Test NL-to-SQL**
   - On Query Page, find "Natural Language Query" section
   - Enter: "Show all customers from New York"
   - Click "Generate SQL"
   - ✅ Verify SQL is generated
   - ✅ Verify explanation is shown
   - ✅ Verify "Use This Query" button populates editor
   - ✅ Verify generated SQL can be executed

#### 2.5 Test Dark Mode

1. **Toggle Dark Mode**
   - Click the sun/moon icon in header
   - ✅ Verify theme switches
   - ✅ Verify preference persists on page refresh

#### 2.6 Test Responsive Design

1. **Resize Browser Window**
   - Make window narrow (mobile size)
   - ✅ Verify layout adapts
   - ✅ Verify components remain usable

### ✅ Phase 3: Edge Cases & Error Handling

#### 3.1 Test Empty States
- ✅ No connections: Shows empty state message
- ✅ No query results: Shows "No query results" message
- ✅ No metadata: Shows appropriate message

#### 3.2 Test Loading States
- ✅ Connection creation: Shows loading spinner
- ✅ Metadata extraction: Shows loading state
- ✅ Query execution: Shows loading indicator
- ✅ Schema explorer: Shows skeleton loader

#### 3.3 Test Connection Persistence
- ✅ Refresh page: Active connection persists
- ✅ Close and reopen browser: Connection selection persists

## API Testing with curl (Alternative)

If you prefer curl commands:

```bash
# List connections
curl http://localhost:8000/connections

# Create connection
curl -X POST http://localhost:8000/connections \
  -H "Content-Type: application/json" \
  -d '{"name": "Test DB", "connectionUrl": "postgresql://user:pass@host:5432/db"}'

# Get metadata
curl http://localhost:8000/connections/{id}/metadata

# Execute query
curl -X POST http://localhost:8000/connections/{id}/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM users LIMIT 10"}'

# Generate SQL from NL
curl -X POST http://localhost:8000/connections/{id}/query/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "show all customers"}'
```

## Expected Test Results

### ✅ All Features Working

- Connection management (CRUD)
- Schema exploration
- SQL query execution
- Query validation and safety
- Natural language to SQL (if API key configured)
- Dark mode
- Responsive design
- Error handling
- Loading states

### ⚠️ Common Issues

**Backend won't start:**
- Check Python version: `python --version` (need 3.11+)
- Check dependencies: `uv sync`
- Check .env file exists

**Frontend won't start:**
- Check Node.js version: `node --version` (need 18+)
- Check dependencies: `npm install`
- Check port 5173 is available

**Connection fails:**
- Verify PostgreSQL is running
- Verify connection URL format: `postgresql://user:password@host:port/database`
- Check network connectivity

**NL-to-SQL fails:**
- Verify OPENAI_API_KEY is set in backend/.env
- Restart backend after changing .env
- Check API key is valid

## Next Steps

After successful testing:

1. ✅ Verify all user stories work
2. ✅ Test with real database
3. ✅ Test error scenarios
4. ✅ Verify performance with large datasets
5. ✅ Check browser console for errors
6. ✅ Verify API documentation at /docs

## Troubleshooting

See `TEST.md` or `TESTING_SUMMARY.md` for detailed troubleshooting steps.
