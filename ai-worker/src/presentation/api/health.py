from fastapi import APIRouter, HTTPException
import logging
from src.infrastructure.database.postgres_connection import database_connection
from src.infrastructure.message_queue.redis_queue import redis_client
from src.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        await redis_client.redis_client.ping()
        
        pool = database_connection.get_pool()
        async with pool.acquire() as connection:
            await connection.fetchval("SELECT 1")
        
        return {
            "status": "healthy",
            "service": settings.app_name,
            "redis": "connected",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": settings.app_name,
            "error": str(e)
        }

@router.get("/metrics")
async def get_metrics():
    """Get basic service metrics"""
    try:
        queue_length = await redis_client.redis_client.llen(settings.queue_name)
        
        return {
            "queue_length": queue_length,
            "worker_concurrency": settings.worker_concurrency,
            "max_retries": settings.max_retries
        }
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get metrics")