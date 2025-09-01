import redis.asyncio as redis
from redis.asyncio.connection import ConnectionPool
from typing import Optional, Dict, Any
import json
import logging
from src.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.pool: Optional[ConnectionPool] = None
        self.redis_client: Optional[redis.Redis] = None
    
    async def initialize(self):
        """Initialize Redis connection pool"""
        try:
            self.pool = ConnectionPool.from_url(
                settings.redis_url,
                max_connections=settings.redis_max_connections,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            self.redis_client = redis.Redis(
                connection_pool=self.pool,
                decode_responses=True
            )
            
            await self.redis_client.ping()
            logger.info("Redis connection established successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Redis connection: {e}")
            raise
    
    async def close(self):
        """Close Redis connections"""
        if self.redis_client:
            await self.redis_client.close()
        if self.pool:
            await self.pool.disconnect()
    
    async def pop_from_queue(self, queue_name: str, timeout: int = 10) -> Optional[Dict[Any, Any]]:
        """Pop message from Redis queue with blocking"""
        try:
            result = await self.redis_client.brpop(queue_name, timeout=timeout)
            if result:
                _, message_json = result
                return json.loads(message_json)
            return None
        except Exception as e:
            logger.error(f"Failed to pop message from queue {queue_name}: {e}")
            return None

redis_client = RedisClient()