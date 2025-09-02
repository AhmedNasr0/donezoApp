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
            
            video_url = await self.job_repository.get_video_url_by_job_id(request.job_id)
            if not video_url:
                error_msg = f"No video URL found for job {request.job_id}"
                logger.error(error_msg)
                await self.job_repository.update_job_status(
                    request.job_id,
                    JobStatus.FAILED,
                    error=error_msg
                )
                return False
                
            
            # Transcribe video
            transcript = await self.orchestrator.transcribe(video_url)
            if not transcript:
                error_msg = f"Empty transcript received for job {request.job_id}"
                logger.error(error_msg)
                await self.job_repository.update_job_status(
                    request.job_id,
                    JobStatus.FAILED,
                    error=error_msg
                )
                return False

            success = await self.job_repository.update_job_status(
                request.job_id,
                JobStatus.DONE,
                transcription=transcript
            )
            
            if success:
                return True
            else:
                error_msg = f"Failed to update job {request.job_id} in database"
                logger.error(error_msg)
                # Try to update with failed status
                await self.job_repository.update_job_status(
                    request.job_id,
                    JobStatus.FAILED,
                    error=error_msg
                )
                return False
            
        except TranscriptionFailed as e:
            error_msg = f"Transcription failed for job {request.job_id}: {str(e)}"
            logger.error(error_msg)
            await self.job_repository.update_job_status(
                request.job_id,
                JobStatus.FAILED,
                error=str(e)
            )
            return False
            
        except Exception as e:
            error_msg = f"Unexpected error processing job {request.job_id}: {str(e)}"
            logger.error(error_msg)
            await self.job_repository.update_job_status(
                request.job_id,
                JobStatus.FAILED,
                error=str(e)
            )
            return False