import httpx
from typing import Optional
import logging
from src.domain.services.transcription_service import TranscriptionService
from src.domain.entities.job import TranscriptionProvider
from src.core.exceptions import TranscriptionFailed, ExternalServiceError
from src.core.config import settings

logger = logging.getLogger(__name__)

class SupadataClient(TranscriptionService):
    def __init__(self, api_key: str = settings.supadata_api_key):
        self.api_key = api_key
    
    async def transcribe(self, video_url: str, language: str = "en", **kwargs) -> str:
        """Transcribe video using Supadata API"""
        try:
            from supadata import Supadata
            
            supadata = Supadata(api_key=self.api_key)
            
            transcript = supadata.transcript(
                url=video_url,
                lang=language,
                text=True,
                mode="auto"
            )
            
            if not transcript or not transcript.content.strip():
                raise TranscriptionFailed("Empty transcription result from Supadata")
            
            logger.info(f"Successfully transcribed video with Supadata: {video_url[:100]}...")
            return transcript.content.strip()
            
        except Exception as e:
            if "SupadataError" in str(type(e)):
                logger.error(f"Supadata API error for {video_url}: {e}")
                raise ExternalServiceError(f"Supadata API error: {e}")
            else:
                logger.error(f"Supadata transcription failed for {video_url}: {e}")
                raise TranscriptionFailed(f"Supadata transcription failed: {e}")
    
    def get_provider(self) -> TranscriptionProvider:
        return TranscriptionProvider.SUPADATA