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
        self.services = services

    async def transcribe(self, video_url: str) -> str:
        """Try transcription with fallback strategy"""
        last_error = None
        for service in self.services:
            try:
                logger.info(f"Trying transcription with {service.__class__.__name__}")
                return await service.transcribe(video_url)
            except Exception as e:
                logger.warning(f"Service {service.__class__.__name__} failed: {e}")
                last_error = e
        
        raise TranscriptionFailed(f"All transcription services failed: {last_error}")
