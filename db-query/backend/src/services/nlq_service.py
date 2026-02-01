"""Natural Language Query service for SQL generation."""

import asyncio
import json
from typing import Any

import sqlglot
from openai import AsyncOpenAI

from ..config import settings
from ..models.metadata import DatabaseMetadata
from ..models.query import GeneratedQuery
from ..services.metadata_service import MetadataService


class NLQService:
    """Service for generating SQL from natural language queries."""

    @staticmethod
    def format_schema_for_prompt(metadata: DatabaseMetadata) -> str:
        """Format database metadata into a prompt-friendly schema description."""
        lines = ["Database Schema:\n"]
        
        for table in metadata.tables:
            # Use the correct field name 'type' instead of 'table_type'
            table_type = "TABLE" if table.type.value == "table" else "VIEW"
            lines.append(f"{table_type}: {table.name}")
            
            lines.append("  Columns:")
            for col in table.columns:
                col_info = f"    - {col.name} ({col.data_type})"
                if col.is_nullable:
                    col_info += " [nullable]"
                if col.is_primary_key:
                    col_info += " [PRIMARY KEY]"
                if col.default_value:
                    col_info += f" DEFAULT {col.default_value}"
                # Handle foreign key if present
                if col.foreign_key:
                    col_info += f" -> {col.foreign_key.table}.{col.foreign_key.column} [FK]"
                lines.append(col_info)
            
            if table.row_count_estimate is not None:
                lines.append(f"  Estimated Rows: {table.row_count_estimate:,}")
            
            lines.append("")
        
        return "\n".join(lines)

    @staticmethod
    async def generate_sql(
        connection_id: str, natural_language_query: str, max_retries: int = 3
    ) -> GeneratedQuery:
        """Generate SQL from natural language query using OpenAI."""
        from uuid import UUID
        from ..services.connection_service import ConnectionService
        from ..models.metadata import DatabaseType
        
        # Validate OpenAI configuration
        if not settings.openai_api_key or settings.openai_api_key.strip() == "":
            raise ValueError("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.")
        
        if not settings.openai_api_url or settings.openai_api_url.strip() == "":
            raise ValueError("OpenAI API URL is not configured. Please set OPENAI_API_URL environment variable.")
        
        connection_uuid = UUID(connection_id)
        
        # Get database type
        database_type = await ConnectionService.get_database_type(connection_uuid)
        
        # Get database metadata
        metadata = await MetadataService.get_cached_metadata(connection_uuid)
        if not metadata:
            # Try to extract if not cached
            metadata = await MetadataService.extract_metadata(connection_uuid)
        
        # Format schema for prompt
        schema_prompt = NLQService.format_schema_for_prompt(metadata)
        
        # Create OpenAI client with configurable API URL
        try:
            client = AsyncOpenAI(
                api_key=settings.openai_api_key,
                base_url=settings.openai_api_url,
                timeout=60.0,  # 60 second timeout
            )
        except Exception as e:
            raise ValueError(f"Failed to initialize OpenAI client: {str(e)}")
        
        # Determine database dialect and system prompt
        if database_type == DatabaseType.MYSQL:
            db_name = "MySQL"
            dialect = "mysql"
            system_prompt = """You are a SQL expert assistant. Your task is to generate MySQL SELECT queries based on natural language descriptions.

Rules:
1. Only generate SELECT statements - never INSERT, UPDATE, DELETE, or DDL statements
2. Use proper MySQL syntax (use backticks for identifiers if needed)
3. Include appropriate JOINs when querying multiple tables
4. Use meaningful column aliases when needed
5. Add WHERE clauses for filtering when specified
6. Use aggregate functions (COUNT, SUM, AVG, etc.) when appropriate
7. Return only valid MySQL SELECT SQL - no explanations in the SQL itself

Respond with a JSON object containing:
- "sql": The generated SQL query (SELECT statement only)
- "explanation": A brief explanation of what the query does"""
            user_prompt = f"""{schema_prompt}

User Query: {natural_language_query}

Generate a MySQL SELECT query for the above request. Return only a JSON object with "sql" and "explanation" fields."""
        else:
            db_name = "PostgreSQL"
            dialect = "postgres"
            system_prompt = """You are a SQL expert assistant. Your task is to generate PostgreSQL SELECT queries based on natural language descriptions.

Rules:
1. Only generate SELECT statements - never INSERT, UPDATE, DELETE, or DDL statements
2. Use proper PostgreSQL syntax
3. Include appropriate JOINs when querying multiple tables
4. Use meaningful column aliases when needed
5. Add WHERE clauses for filtering when specified
6. Use aggregate functions (COUNT, SUM, AVG, etc.) when appropriate
7. Return only valid PostgreSQL SELECT SQL - no explanations in the SQL itself

Respond with a JSON object containing:
- "sql": The generated SQL query (SELECT statement only)
- "explanation": A brief explanation of what the query does"""
            user_prompt = f"""{schema_prompt}

User Query: {natural_language_query}

Generate a PostgreSQL SELECT query for the above request. Return only a JSON object with "sql" and "explanation" fields."""
        
        # Retry logic with exponential backoff
        last_error = None
        for attempt in range(max_retries):
            try:
                response = await client.chat.completions.create(
                    model=settings.openai_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.1,  # Low temperature for deterministic SQL
                    response_format={"type": "json_object"},
                )
                
                # Parse response with proper None checks and error handling
                if not response:
                    raise ValueError("Empty response object from OpenAI")
                
                # Check if response has error information (OpenAI SDK error format)
                if hasattr(response, 'error') and response.error:
                    error_info = response.error
                    error_msg = getattr(error_info, 'message', str(error_info))
                    error_type = getattr(error_info, 'type', 'unknown')
                    error_code = getattr(error_info, 'code', None)
                    raise ValueError(
                        f"OpenAI API returned an error ({error_type}" +
                        (f", code: {error_code}" if error_code else "") +
                        f"): {error_msg}"
                    )
                
                # Check response structure
                response_type = type(response).__name__
                
                # Log response structure for debugging (only if choices missing)
                if not hasattr(response, 'choices'):
                    # Try to get response attributes for debugging
                    response_attrs = []
                    if hasattr(response, '__dict__'):
                        response_attrs = list(response.__dict__.keys())
                    elif hasattr(response, '__slots__'):
                        response_attrs = list(response.__slots__)
                    else:
                        # Try dir() to get all attributes
                        response_attrs = [attr for attr in dir(response) if not attr.startswith('_')]
                    
                    # Try to get string representation (limited length)
                    response_repr = str(response)[:500] if response else "None"
                    
                    raise ValueError(
                        f"OpenAI response missing 'choices' attribute. "
                        f"Response type: {response_type}, "
                        f"Available attributes: {response_attrs[:10]}, "
                        f"Response preview: {response_repr}"
                    )
                
                # Check if choices is None or empty
                if response.choices is None:
                    # Check for other response attributes that might indicate an error or provide context
                    response_info = {}
                    for attr in ['id', 'object', 'created', 'model', 'usage', 'system_fingerprint']:
                        if hasattr(response, attr):
                            value = getattr(response, attr)
                            # Limit string length for logging
                            response_info[attr] = str(value)[:100] if value else None
                    
                    raise ValueError(
                        f"No choices in OpenAI response (choices is None). "
                        f"Response type: {response_type}, "
                        f"Response info: {response_info}. "
                        f"This may indicate: 1) API endpoint mismatch, 2) API returned error format, "
                        f"3) Model not available, 4) Rate limit or quota exceeded."
                    )
                
                # Now we know choices is not None, check if it's empty
                if not response.choices:
                    # Empty list or falsy value
                    response_info = {}
                    for attr in ['id', 'object', 'created', 'model', 'usage', 'system_fingerprint']:
                        if hasattr(response, attr):
                            value = getattr(response, attr)
                            response_info[attr] = str(value)[:100] if value else None
                    
                    raise ValueError(
                        f"Empty choices array in OpenAI response. "
                        f"Response type: {response_type}, "
                        f"Response info: {response_info}."
                    )
                
                # Verify choices is a list/sequence and has elements
                try:
                    choices_len = len(response.choices)
                except TypeError:
                    raise ValueError(
                        f"OpenAI response.choices is not a sequence. "
                        f"Type: {type(response.choices)}, Value: {response.choices}"
                    )
                
                if choices_len == 0:
                    raise ValueError("Empty choices array in OpenAI response")
                
                # Safely get the first choice
                try:
                    choice = response.choices[0]
                except (IndexError, TypeError) as e:
                    raise ValueError(
                        f"Cannot access first choice from OpenAI response. "
                        f"Choices type: {type(response.choices)}, "
                        f"Choices length: {len(response.choices) if hasattr(response.choices, '__len__') else 'N/A'}, "
                        f"Error: {str(e)}"
                    )
                
                if choice is None:
                    raise ValueError("First choice is None in OpenAI response")
                
                if not hasattr(choice, 'message') or not choice.message:
                    raise ValueError("No message in OpenAI response choice")
                
                content = choice.message.content
                if not content:
                    raise ValueError("Empty content in OpenAI response message")
                
                result = json.loads(content)
                
                if not isinstance(result, dict):
                    raise ValueError("OpenAI response is not a JSON object")
                
                sql = result.get("sql", "").strip()
                explanation = result.get("explanation", "").strip()
                
                if not sql:
                    raise ValueError("No SQL generated in response")
                
                # Validate generated SQL with appropriate dialect
                NLQService.validate_generated_sql(sql, dialect=dialect)
                
                return GeneratedQuery(sql=sql, explanation=explanation)
                
            except json.JSONDecodeError as e:
                last_error = ValueError(f"Invalid JSON response from OpenAI: {str(e)}")
            except ValueError as e:
                # Validation errors - don't retry
                raise e
            except (TypeError, AttributeError, IndexError) as e:
                # Handle None/attribute/index errors specifically
                error_msg = str(e)
                error_type = type(e).__name__
                raise ValueError(f"OpenAI API response parsing error ({error_type}): {error_msg}. The API may have returned an unexpected response format.")
            except Exception as e:
                # Capture the original error for better debugging
                error_msg = str(e)
                error_type = type(e).__name__
                
                # Check for OpenAI SDK specific exceptions
                error_module = type(e).__module__
                if 'openai' in error_module.lower():
                    # This is an OpenAI SDK exception
                    if hasattr(e, 'status_code'):
                        status_code = e.status_code
                        if status_code == 401:
                            raise ValueError(f"OpenAI API authentication failed (401): {error_msg}")
                        elif status_code == 429:
                            last_error = ValueError(f"OpenAI API rate limit exceeded (429): {error_msg}")
                        elif status_code == 404:
                            raise ValueError(f"OpenAI API endpoint not found (404). Check OPENAI_API_URL configuration. Current: {settings.openai_api_url}")
                        elif status_code == 400:
                            raise ValueError(f"OpenAI API bad request (400): {error_msg}. Check model name and request format.")
                        else:
                            raise ValueError(f"OpenAI API error (HTTP {status_code}): {error_msg}")
                    else:
                        raise ValueError(f"OpenAI SDK error ({error_type}): {error_msg}")
                
                # Provide more specific error messages for common cases
                if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
                    raise ValueError(f"OpenAI API authentication failed: {error_msg}")
                elif "connection" in error_msg.lower() or "network" in error_msg.lower() or "timeout" in error_msg.lower():
                    last_error = ValueError(f"Network error connecting to OpenAI API: {error_msg}")
                elif "rate_limit" in error_msg.lower() or "quota" in error_msg.lower():
                    last_error = ValueError(f"OpenAI API rate limit/quota exceeded: {error_msg}")
                else:
                    last_error = ValueError(f"OpenAI API error ({error_type}): {error_msg}")
                
                if attempt < max_retries - 1:
                    # Exponential backoff: 1s, 2s, 4s
                    wait_time = 2 ** attempt
                    await asyncio.sleep(wait_time)
                else:
                    raise last_error
        
        # Should not reach here, but handle it
        if last_error:
            raise last_error
        raise ValueError("Failed to generate SQL: Unknown error")

    @staticmethod
    def validate_generated_sql(sql: str, dialect: str = "postgres") -> None:
        """Validate that generated SQL is a valid SELECT statement."""
        try:
            # Remove comments before parsing and validation
            sql_clean = NLQService._remove_comments(sql)
            
            parsed = sqlglot.parse_one(sql_clean, dialect=dialect)
            
            if not isinstance(parsed, sqlglot.exp.Select):
                raise ValueError("Generated SQL must be a SELECT statement")
            
            # Additional validation: check for forbidden keywords in non-comment parts
            sql_upper = sql_clean.upper()
            forbidden_keywords = ["INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "TRUNCATE"]
            
            # Check if any forbidden keyword appears as a standalone statement
            # (not as part of a string literal or identifier)
            for keyword in forbidden_keywords:
                # Check if keyword appears in SQL (case-insensitive)
                if keyword in sql_upper:
                    # More sophisticated check: ensure it's not part of a larger word
                    # and not in a string literal
                    import re
                    # Pattern to match keyword as a standalone word (not part of identifier)
                    pattern = r'\b' + re.escape(keyword) + r'\b'
                    if re.search(pattern, sql_upper):
                        # Check if it's in a string literal (between quotes)
                        # Simple check: count quotes before and after
                        matches = list(re.finditer(pattern, sql_upper))
                        for match in matches:
                            pos = match.start()
                            # Check if we're inside a string literal
                            before = sql_upper[:pos]
                            # Count single and double quotes (simple heuristic)
                            single_quotes_before = before.count("'") - before.count("\\'")
                            double_quotes_before = before.count('"') - before.count('\\"')
                            # If odd number of quotes before, we're inside a string
                            if single_quotes_before % 2 == 1 or double_quotes_before % 2 == 1:
                                continue  # Inside string literal, skip
                            # If keyword appears and we're not in a string, it's forbidden
                            raise ValueError(f"Generated SQL contains forbidden keyword: {keyword}")
        
        except sqlglot.errors.ParseError as e:
            raise ValueError(f"Generated SQL has syntax errors: {str(e)}")

    @staticmethod
    def _remove_comments(sql: str) -> str:
        """Remove SQL comments from the SQL string."""
        import re
        # Remove single-line comments (-- ...)
        sql = re.sub(r'--.*?$', '', sql, flags=re.MULTILINE)
        # Remove multi-line comments (/* ... */)
        sql = re.sub(r'/\*.*?\*/', '', sql, flags=re.DOTALL)
        return sql.strip()
