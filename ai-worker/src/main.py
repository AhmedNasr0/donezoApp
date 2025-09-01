import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.core.config import settings
from src.infrastructure.database.postgres_connection import database_connection
from src.infrastructure.message_queue.redis_queue import redis_client
from src.infrastructure.message_queue.queue_consumer import QueueConsumer
from src.presentation.api.health import router as health_router
from src.application.use_cases.process_job_use_case import ProcessJobUseCase
from src.presentation.dependencies.container import get_process_job_use_case
from src.application.dto.job_dto import JobProcessRequest
from src.domain.entities.job import TranscriptionProvider

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

queue_consumer = QueueConsumer()

async def message_handler(message: dict):
    """Handle queue messages"""
    try:
        logger.info(f"Processing message: {message}")
        
        job_id = message.get("jobId")

        if not job_id:
            logger.error("No jobId in message")
            return
        
        request = JobProcessRequest(
            job_id=job_id
        )
        
        use_case = get_process_job_use_case()
        success = await use_case.execute(request)
        print("success",success)
        if success:
            logger.info(f"Successfully processed job {job_id}")
        else:
            logger.error(f"Failed to process job {job_id}")
            
    except Exception as e:
        logger.error(f"Failed to process message {message}: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.app_name}...")
    
    try:
        # initialize connections
        await database_connection.connect()
        await redis_client.initialize()
        
        # queue consumer with multiple workers (depend on the number )
        consumer_task = asyncio.create_task(
            queue_consumer.start_consuming(
                message_handler, 
                worker_count=settings.worker_concurrency
            )
        )
        
        logger.info(f"Service started with {settings.worker_concurrency} workers")
        yield
        
    except Exception as e:
        logger.error(f"Failed to start service: {e}")
        raise
    
    finally:
        logger.info(f"Shutting down {settings.app_name}...")
        
        try:
            await queue_consumer.stop_consuming()
            consumer_task.cancel()
            
            await redis_client.close()
            await database_connection.disconnect()
            
            logger.info("Service shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

app = FastAPI(
    title=settings.app_name,
    description="Background worker service for video transcription processing",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(health_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )