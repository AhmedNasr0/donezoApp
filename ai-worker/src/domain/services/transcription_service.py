from abc import ABC, abstractmethod
from typing import Dict, Any
from ..entities.job import TranscriptionProvider

class TranscriptionService(ABC):
    @abstractmethod
    async def transcribe(self, video_url: str, 
                        **kwargs) -> str:
        pass
    
    @abstractmethod
    def get_provider(self) -> TranscriptionProvider:
        pass