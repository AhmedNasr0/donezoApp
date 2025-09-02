import asyncio
import logging
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uuid
from datetime import datetime

from src.core.config import settings
from src.infrastructure.message_queue.redis_queue import redis_client
from src.infrastructure.message_queue.queue_consumer import QueueConsumer
from src.presentation.api.health import router as health_router
from src.application.use_cases.process_job_use_case import ProcessJobUseCase
from src.presentation.dependencies.container import get_process_job_use_case
from src.application.dto.job_dto import JobProcessRequest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global variables for background tasks
queue_consumer = QueueConsumer()
background_tasks_running = False

# Request/Response models for API
class JobSubmissionRequest(BaseModel):
    video_url: str
    callback_url: str = None
    metadata: dict = {}

class JobSubmissionResponse(BaseModel):
    job_id: str
    status: str
    message: str

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int = 0
    result: dict = None

async def message_handler(message: dict):
    """Handle background queue messages"""
    try:
        job_id = message.get("jobId")

        if not job_id:
            logger.error("No jobId in message")
            return
        
        logger.info(f"Processing job {job_id}")
        
        # Update job status to processing
        try:
            await redis_client.update_job_status(job_id, "processing")
        except:
            pass  # Continue even if status update fails
        
        request = JobProcessRequest(job_id=job_id)
        use_case = get_process_job_use_case()
        success = await use_case.execute(request)
        
        # Update final status
        final_status = "completed" if success else "failed"
        try:
            await redis_client.update_job_status(job_id, final_status)
        except:
            pass
        
        if success:
            logger.info(f"Successfully processed job {job_id}")
        else:
            logger.error(f"Failed to process job {job_id}")
            
    except Exception as e:
        logger.error(f"Failed to process message {message}: {e}")
        # Update job status to failed
        job_id = message.get("jobId")
        if job_id:
            try:
                await redis_client.update_job_status(job_id, "failed", error=str(e))
            except:
                pass

async def start_background_workers():
    """Start background workers"""
    global background_tasks_running
    
    if background_tasks_running:
        return
        
    try:
        logger.info(f"Starting background workers with {settings.worker_concurrency} workers")
        
        # Start queue consumer
        consumer_task = asyncio.create_task(
            queue_consumer.start_consuming(
                message_handler, 
                worker_count=settings.worker_concurrency
            )
        )
        
        background_tasks_running = True
        logger.info("Background workers started successfully")
        
        # Don't await here - let it run in background
        return consumer_task
        
    except Exception as e:
        logger.error(f"Failed to start background workers: {e}")
        raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info(f"Starting {settings.app_name}...")
    
    consumer_task = None
    
    try:
        # Initialize Redis
        await redis_client.initialize()
        logger.info("Redis connection established")
        
        # Start background workers
        consumer_task = await start_background_workers()
        
        logger.info("Service started successfully")
        yield
        
    except Exception as e:
        logger.error(f"Failed to start service: {e}")
        raise
    
    finally:
        logger.info(f"Shutting down {settings.app_name}...")
        
        global background_tasks_running
        background_tasks_running = False
        
        try:
            # Stop background workers
            if consumer_task:
                await queue_consumer.stop_consuming()
                consumer_task.cancel()
                
                try:
                    await consumer_task
                except asyncio.CancelledError:
                    pass
            
            # Close Redis
            await redis_client.close()
            logger.info("Service shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

app = FastAPI(
    title=f"{settings.app_name} API",
    description="Unified video transcription service with API and background processing",
    version="1.0.0",
    lifespan=lifespan
)

# API Endpoints just dummy

@app.get("/")
async def root():
    """Root endpoint - required for Render health checks"""
    return {
        "service": "Video Transcription Service",
        "status": "running",
        "version": "1.0.0",
        "features": ["api", "background_workers"]
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check Redis connection
        redis_status = "connected"
        try:
            await redis_client.ping()
        except:
            redis_status = "disconnected"
        
        # Check background workers
        worker_status = "running" if background_tasks_running else "stopped"
        
        overall_status = "healthy" if redis_status == "connected" and worker_status == "running" else "degraded"
        
        return {
            "status": overall_status,
            "components": {
                "redis": redis_status,
                "background_workers": worker_status,
                "worker_count": settings.worker_concurrency
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.post("/jobs/submit", response_model=JobSubmissionResponse)
async def submit_job(request: JobSubmissionRequest):
    """Submit a new video transcription job"""
    try:
        job_id = str(uuid.uuid4())
        
        # Create job message for queue
        job_message = {
            "jobId": job_id,
            "videoUrl": request.video_url,
            "callbackUrl": request.callback_url,
            "metadata": request.metadata,
            "status": "pending",
            "createdAt": datetime.utcnow().isoformat()
        }
        
        await redis_client.add_to_queue("video_processing", job_message)
        
        await redis_client.store_job_info(job_id, {
            "status": "queued",
            "video_url": request.video_url,
            "created_at": job_message["createdAt"],
            "metadata": request.metadata
        })
        
        logger.info(f"Job {job_id} submitted and queued")
        
        return JobSubmissionResponse(
            job_id=job_id,
            status="queued",
            message="Job submitted successfully and queued for processing"
        )
        
    except Exception as e:
        logger.error(f"Failed to submit job: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit job: {str(e)}")

@app.get("/jobs/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Get the current status of a job"""
    try:
        # Get job info from Redis
        job_info = await redis_client.get_job_info(job_id)
        
        if not job_info:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return JobStatusResponse(
            job_id=job_id,
            status=job_info.get("status", "unknown"),
            progress=job_info.get("progress", 0),
            result=job_info.get("result")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job status for {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve job status")

@app.get("/jobs")
async def list_jobs(limit: int = 20, status: str = None):
    """List recent jobs with optional status filter"""
    try:
        jobs = await redis_client.get_recent_jobs(limit=limit, status_filter=status)
        
        return {
            "jobs": jobs,
            "count": len(jobs),
            "limit": limit,
            "filter": {"status": status} if status else None
        }
        
    except Exception as e:
        logger.error(f"Failed to list jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve jobs")

@app.delete("/jobs/{job_id}")
async def cancel_job(job_id: str):
    """Cancel a pending or processing job"""
    try:
        # Check if job exists and can be cancelled
        job_info = await redis_client.get_job_info(job_id)
        
        if not job_info:
            raise HTTPException(status_code=404, detail="Job not found")
        
        current_status = job_info.get("status")
        if current_status in ["completed", "failed", "cancelled"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot cancel job with status: {current_status}"
            )
        
        # Update status to cancelled
        await redis_client.update_job_status(job_id, "cancelled")
        
        logger.info(f"Job {job_id} cancelled")
        
        return {
            "job_id": job_id,
            "message": "Job cancelled successfully",
            "previous_status": current_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel job")

@app.get("/stats")
async def get_service_stats():
    """Get service statistics"""
    try:
        stats = await redis_client.get_queue_stats()
        
        return {
            "background_workers": {
                "status": "running" if background_tasks_running else "stopped",
                "worker_count": settings.worker_concurrency
            },
            "queue_stats": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")

app.include_router(health_router, prefix="/api")

port = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,  
        host="0.0.0.0", 
        port=port,
        reload=False,  
        access_log=True
    )