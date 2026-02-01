"""Query service for SQL validation and execution."""

import asyncio
import time
from typing import Any
from uuid import UUID
from urllib.parse import urlparse, parse_qs

import asyncpg
import aiomysql
import sqlglot

from ..config import settings
from ..models.metadata import DatabaseType
from ..models.query import QueryResult
from ..services.connection_service import ConnectionService


def _parse_mysql_url(url: str) -> dict[str, str | int]:
    """Parse MySQL connection URL into connection parameters."""
    parsed = urlparse(url)
    
    # Handle mysql:// and mysql+pymysql:// schemes
    if url.startswith("mysql+pymysql://"):
        url = url.replace("mysql+pymysql://", "mysql://", 1)
        parsed = urlparse(url)
    
    config = {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 3306,
        "user": parsed.username or "root",
        "password": parsed.password or "",
        "db": parsed.path.lstrip("/") if parsed.path else None,
    }
    
    # Parse query parameters
    if parsed.query:
        query_params = parse_qs(parsed.query)
        if "charset" in query_params:
            config["charset"] = query_params["charset"][0]
        else:
            config["charset"] = "utf8mb4"
    
    return config


class QueryService:
    """Service for executing SQL queries."""

    @staticmethod
    def validate_and_transform(sql: str, dialect: str = "postgres") -> str:
        """Validate SQL and transform (add LIMIT if missing)."""
        try:
            # Parse SQL
            parsed = sqlglot.parse_one(sql, dialect=dialect)
            
            # Reject non-SELECT statements
            if not isinstance(parsed, sqlglot.exp.Select):
                raise ValueError("Only SELECT statements are allowed")
            
            # Add LIMIT if missing
            if parsed.args.get("limit") is None:
                parsed = parsed.limit(1000)
            
            return parsed.sql(dialect=dialect)
        except sqlglot.errors.ParseError as e:
            raise ValueError(f"Invalid SQL syntax: {str(e)}")

    @staticmethod
    async def execute_query(connection_id: str, sql: str) -> QueryResult:
        """Execute a SQL query against PostgreSQL or MySQL."""
        connection_uuid = UUID(connection_id)
        database_type = await ConnectionService.get_database_type(connection_uuid)
        
        if database_type == DatabaseType.MYSQL:
            return await QueryService._execute_mysql_query(connection_uuid, sql)
        else:
            return await QueryService._execute_postgresql_query(connection_uuid, sql)

    @staticmethod
    async def _execute_postgresql_query(connection_id: UUID, sql: str) -> QueryResult:
        """Execute a SQL query against PostgreSQL."""
        # Validate and transform SQL
        transformed_sql = QueryService.validate_and_transform(sql, dialect="postgres")
        
        # Get connection URL
        connection_url = await ConnectionService.get_connection_url(connection_id)
        
        # Connect to PostgreSQL
        start_time = time.time()
        conn = await asyncpg.connect(connection_url, timeout=settings.query_timeout)
        
        try:
            # Execute query with timeout
            rows = await asyncio.wait_for(
                conn.fetch(transformed_sql),
                timeout=settings.query_timeout
            )
            
            # Convert rows to dictionaries
            result_rows: list[dict[str, Any]] = []
            columns: list[str] = []
            
            if rows:
                # Get columns from first row
                columns = list(rows[0].keys())
                for row in rows:
                    result_rows.append(dict(row))
            else:
                # Empty result set - parse columns from SELECT statement
                try:
                    parsed = sqlglot.parse_one(transformed_sql, dialect="postgres")
                    if isinstance(parsed, sqlglot.exp.Select):
                        # Extract column names/aliases from SELECT expressions
                        for expr in parsed.expressions:
                            alias = getattr(expr, 'alias', None)
                            if alias:
                                columns.append(str(alias))
                            else:
                                # Try to get the column name
                                name = getattr(expr, 'this', None)
                                if name:
                                    columns.append(str(name))
                                else:
                                    columns.append(str(expr))
                except Exception:
                    # If parsing fails, columns will be empty
                    pass
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Check if results were truncated (LIMIT was added)
            original_has_limit = "LIMIT" in sql.upper()
            transformed_has_limit = "LIMIT" in transformed_sql.upper()
            truncated = transformed_has_limit and not original_has_limit
            
            return QueryResult(
                columns=columns,
                rows=result_rows,
                row_count=len(result_rows),
                truncated=truncated,
                duration_ms=duration_ms,
            )
        except asyncpg.PostgresError as e:
            raise ValueError(f"Database error: {str(e)}")
        except asyncio.TimeoutError:
            raise ValueError(f"Query timeout after {settings.query_timeout} seconds")
        except Exception as e:
            raise ValueError(f"Query execution failed: {str(e)}")
        finally:
            await conn.close()

    @staticmethod
    async def _execute_mysql_query(connection_id: UUID, sql: str) -> QueryResult:
        """Execute a SQL query against MySQL."""
        # Validate and transform SQL
        transformed_sql = QueryService.validate_and_transform(sql, dialect="mysql")
        
        # Get connection URL
        connection_url = await ConnectionService.get_connection_url(connection_id)
        config = _parse_mysql_url(connection_url)
        
        if not config["db"]:
            raise ValueError("Database name is required in MySQL connection URL")
        
        # Connect to MySQL
        start_time = time.time()
        conn = await aiomysql.connect(
            host=config["host"],
            port=config["port"],
            user=config["user"],
            password=config["password"],
            db=config["db"],
            charset=config.get("charset", "utf8mb4"),
        )
        
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # Execute query with timeout
                await asyncio.wait_for(
                    cursor.execute(transformed_sql),
                    timeout=settings.query_timeout
                )
                
                rows = await cursor.fetchall()
                
                # Convert rows to dictionaries
                result_rows: list[dict[str, Any]] = []
                columns: list[str] = []
                
                if rows:
                    # Get columns from first row
                    columns = list(rows[0].keys())
                    result_rows = [dict(row) for row in rows]
                else:
                    # Empty result set - parse columns from SELECT statement
                    try:
                        parsed = sqlglot.parse_one(transformed_sql, dialect="mysql")
                        if isinstance(parsed, sqlglot.exp.Select):
                            # Extract column names/aliases from SELECT expressions
                            for expr in parsed.expressions:
                                alias = getattr(expr, 'alias', None)
                                if alias:
                                    columns.append(str(alias))
                                else:
                                    # Try to get the column name
                                    name = getattr(expr, 'this', None)
                                    if name:
                                        columns.append(str(name))
                                    else:
                                        columns.append(str(expr))
                    except Exception:
                        # If parsing fails, columns will be empty
                        pass
                
                duration_ms = int((time.time() - start_time) * 1000)
                
                # Check if results were truncated (LIMIT was added)
                original_has_limit = "LIMIT" in sql.upper()
                transformed_has_limit = "LIMIT" in transformed_sql.upper()
                truncated = transformed_has_limit and not original_has_limit
                
                return QueryResult(
                    columns=columns,
                    rows=result_rows,
                    row_count=len(result_rows),
                    truncated=truncated,
                    duration_ms=duration_ms,
                )
        except Exception as e:
            error_msg = str(e)
            if "timeout" in error_msg.lower():
                raise ValueError(f"Query timeout after {settings.query_timeout} seconds")
            raise ValueError(f"Database error: {error_msg}")
        finally:
            conn.close()
