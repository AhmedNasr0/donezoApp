from abc import ABC, abstractmethod
from typing import Optional, Tuple
from ..entities.job import Job, JobStatus

class JobRepository(ABC):
    @abstractmethod
    async def get_by_id(self, job_id: str) -> Optional[Job]:
        pass
    
    @abstractmethod
    async def get_video_url_by_job_id(self, job_id: str) -> Optional[str]:
        pass
    
    @abstractmethod
    async def update_job_status(self, job_id: str, status: JobStatus, 
                               transcription: Optional[str] = None,
                               error: Optional[str] = None) -> bool:
        pass
    
    @abstractmethod
    async def get_job_with_video(self, job_id: str) -> Optional[Tuple[Job, str]]:
        """Get job with video URL"""
        pass
