import logging
from src.domain.entities.job import JobStatus
from src.domain.repositories.job_repository import JobRepository
from src.application.dto.job_dto import JobProcessRequest
from src.core.exceptions import JobNotFound, TranscriptionFailed
from src.application.services.transcription_orchestrator import TranscriptionOrchestrator

logger = logging.getLogger(__name__)

class ProcessJobUseCase:
    def __init__(
        self,
        job_repository: JobRepository,
        orchestrator: TranscriptionOrchestrator
    ):
        self.job_repository = job_repository
        self.orchestrator = orchestrator
    
    async def execute(self, request: JobProcessRequest) -> bool:
        """Process job transcription"""
        try:
            logger.info(f"Processing job {request.job_id}")
            
            video_url = await self.job_repository.get_video_url_by_job_id(request.job_id)
            
            transcript = await self.orchestrator.transcribe(video_url)

            success = await self.job_repository.update_job_status(
                request.job_id,
                JobStatus.DONE,
                transcription=transcript
            )
            
            if success:
                logger.info(f"Successfully processed job {request.job_id}")
                return True
            else:
                logger.error(f"Failed to update job {request.job_id} in database")
                return False
            
        except Exception as e:
            await self.job_repository.update_job_status(
                request.job_id,
                JobStatus.FAILED,
                error=str(e)
            )
            
            logger.error(f"Failed to process job {request.job_id}: {e}")
            return False
