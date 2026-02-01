"""Database migration utilities."""

import logging

from .sqlite import db_pool

logger = logging.getLogger(__name__)


async def migrate_database() -> None:
    """Run database migrations."""
    try:
        # Check if database exists and has connections table
        result = await db_pool.fetch_one(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='connections'"
        )
        if result:
            # Check if database_type column exists by trying to query it
            # This is simpler and more reliable than checking PRAGMA
            try:
                await db_pool.fetch_one("SELECT database_type FROM connections LIMIT 1")
                logger.debug("database_type column already exists, skipping migration")
            except Exception:
                # Column doesn't exist, add it
                logger.info("Adding database_type column to connections table")
                try:
                    await db_pool.execute(
                        "ALTER TABLE connections ADD COLUMN database_type TEXT NOT NULL DEFAULT 'postgresql'"
                    )
                    await db_pool.commit()
                    logger.info("Successfully added database_type column")
                except Exception as alter_error:
                    logger.error(f"Failed to add database_type column: {alter_error}")
                    raise
        else:
            logger.debug("connections table does not exist yet, will be created by schema initialization")
    except Exception as e:
        logger.warning(f"Could not run migrations: {e}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate_database())
