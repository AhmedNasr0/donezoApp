import logging
from typing import List
from src.domain.services.transcription_service import TranscriptionService
from src.core.exceptions import TranscriptionFailed

logger = logging.getLogger(__name__)

class TranscriptionOrchestrator:
    def __init__(self, services: List[TranscriptionService]):
        """
        services: ordered list of transcription services (primary first, then fallbacks)
        """
        if not services:
            raise ValueError("At least one transcription service is required")
        self.services = services

    async def transcribe(self, video_url: str) -> str:
        """Try transcription with fallback strategy"""
        
        if not video_url:
            raise TranscriptionFailed("Video URL is required")
            
        
        last_error = None
        for i, service in enumerate(self.services):
            try:
                service_name = service.__class__.__name__
                
                result = await service.transcribe(video_url)
                
                if result and result.strip():
                    return result.strip()
                else:
                    logger.warning(f"Service {service_name} returned empty result")
                    last_error = Exception(f"{service_name} returned empty transcript")
                    
            except Exception as e:
                logger.warning(f"Service {service.__class__.__name__} failed: {str(e)}")
                last_error = e
        
        error_msg = f"All transcription services failed. Last error: {str(last_error)}" if last_error else "All transcription services failed"
        raise TranscriptionFailed(error_msg)