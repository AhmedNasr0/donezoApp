import asyncpg
from typing import Optional
from src.core.config import settings
import logging

logger = logging.getLogger(__name__)

class PostgreSQLConnection:
    _instance: Optional['PostgreSQLConnection'] = None
    _pool: Optional[asyncpg.Pool] = None
    
    def __new__(cls) -> 'PostgreSQLConnection':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def connect(self) -> None:
        if self._pool is None:
            try:
                self._pool = await asyncpg.create_pool(
                    settings.database_url,
                    min_size=10,
                    max_size=100,
                    command_timeout=60
                )
                logger.info("PostgreSQL connection pool created")
            except Exception as e:
                logger.error(f"Failed to create PostgreSQL pool: {e}")
                raise
    
    async def disconnect(self) -> None:
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("PostgreSQL connection pool closed")
    
    def get_pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError("Database pool not initialized")
        return self._pool

database_connection = PostgreSQLConnection()