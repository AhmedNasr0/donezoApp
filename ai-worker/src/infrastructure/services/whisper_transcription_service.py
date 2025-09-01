import whisper
import tempfile
import httpx
import os
from typing import Optional
import logging
from src.domain.services.transcription_service import TranscriptionService
from src.domain.entities.job import TranscriptionProvider
from src.core.exceptions import TranscriptionFailed

logger = logging.getLogger(__name__)

class WhisperClient(TranscriptionService):
    def __init__(self, model_size: str = "base"):
        self.model_size = model_size
        self.model = None
    
    async def transcribe(self, video_url: str, language: str = "en", **kwargs) -> str:
        """Transcribe video using Whisper AI"""
        try:
            if self.model is None:
                logger.info(f"Loading Whisper model: {self.model_size}")
                self.model = whisper.load_model(self.model_size)
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                logger.info(f"Downloading video from: {video_url[:100]}...")
                response = await client.get(video_url)
                response.raise_for_status()
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
                temp_file.write(response.content)
                temp_path = temp_file.name
            
            try:
                logger.info("Starting Whisper transcription...")
                result = self.model.transcribe(temp_path, language=language)
                transcript = result["text"]
                
                if not transcript or not transcript.strip():
                    raise TranscriptionFailed("Empty transcription result from Whisper")
                
                logger.info(f"Successfully transcribed video with Whisper: {video_url[:100]}...")
                return transcript.strip()
                
            finally:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            logger.error(f"Whisper transcription failed for {video_url}: {e}")
            raise TranscriptionFailed(f"Whisper transcription failed: {e}")
    
    def get_provider(self) -> TranscriptionProvider:
        return TranscriptionProvider.WHISPER