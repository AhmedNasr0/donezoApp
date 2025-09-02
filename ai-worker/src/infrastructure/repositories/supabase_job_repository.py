from typing import Optional, Tuple
from datetime import datetime
import logging

from src.domain.entities.job import Job, JobStatus
from src.domain.repositories.job_repository import JobRepository
from src.infrastructure.database.supabase_client import supabase

logger = logging.getLogger(__name__)

class SupabaseJobRepository(JobRepository):

    async def get_by_id(self, job_id: str) -> Optional[Job]:
        try:
            response = supabase.table("jobs").select("*").eq("id", job_id).single().execute()
            data = response.data
            if not data:
                return None
            
            return Job(
                id=data["id"],
                status=JobStatus(data["status"]),
                resourceid=data["resourceid"],
                transcription=data.get("transcription"),
                error=data.get("error"),
                created_at=data["created_at"],
                updated_at=data["updated_at"]
            )
        except Exception as e:
            logger.error("Error fetching job by id %s: %s", job_id, e)
            return None

    async def get_video_url_by_job_id(self, job_id: str) -> Optional[str]:
        try:
            jobs = await self.getAllJobs()
            if not jobs:
                return None
            
            resourceId = None
            for job in jobs:
                if job["id"] == job_id:
                    resourceId = job["resourceid"]
                    break
            
            if not resourceId:
                logger.warning("No resourceId found for job %s", job_id)
                return None
            
            response = supabase.table("whiteboard_items").select("content").eq("id", resourceId).single().execute()
            
            if not response.data:
                logger.warning("No whiteboard item found for resourceId %s", resourceId)
                return None
            
            content = response.data.get("content")
            return content
            
        except Exception as e:
            logger.error("Error fetching video URL for job %s: %s", job_id, e)
            return None

    async def get_job_with_video(self, job_id: str) -> Optional[Tuple[Job, str]]:
        try:
            job = await self.get_by_id(job_id)
            if not job:
                return None
                
            video_url = await self.get_video_url_by_job_id(job_id)
            if not video_url:
                return None
                
            return job, video_url
            
        except Exception as e:
            logger.error("Error fetching job with video %s: %s", job_id, e)
            return None

    async def update_job_status(
        self, job_id: str, status: JobStatus,
        transcription: Optional[str] = None,
        error: Optional[str] = None
    ) -> bool:
        try:
            update_data = {
                "status": status.value,
                "updated_at": datetime.utcnow().isoformat()
            }
            if transcription is not None:
                update_data["transcription"] = transcription
            if error is not None:
                update_data["error"] = error
            
            response = supabase.table("jobs").update(update_data).eq("id", job_id).execute()
            
            return response.data is not None and len(response.data) > 0
            
        except Exception as e:
            logger.error("Error updating job status for %s: %s", job_id, e)
            return False
    
    async def getAllJobs(self):
        try:
            response = supabase.table("jobs").select("*").execute()
            data = response.data
            if not data:
                return []
            
            return data
        except Exception as e:
            logger.error("Error fetching all jobs: %s", e)
            return None