"""Standalone database migration script."""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.db.migrations import migrate_database
from src.db.sqlite import db_pool
from src.config import settings


async def main():
    """Run migrations."""
    print(f"Running migrations on database: {settings.database_path}")
    
    # Initialize database pool
    await db_pool.initialize()
    
    try:
        # Run migrations
        await migrate_database()
        print("Migrations completed successfully!")
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        await db_pool.close()


if __name__ == "__main__":
    asyncio.run(main())
