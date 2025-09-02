from functools import lru_cache
from typing import Dict
from src.infrastructure.repositories.supabase_job_repository import SupabaseJobRepository
from src.infrastructure.services.supadata_transcription_service import SupadataClient
from src.infrastructure.services.whisper_transcription_service import WhisperClient
from src.application.use_cases.process_job_use_case import ProcessJobUseCase
from src.application.services.transcription_orchestrator import TranscriptionOrchestrator

@lru_cache()
def get_job_repository() -> SupabaseJobRepository:
    return SupabaseJobRepository()

@lru_cache()
def get_supadata_client() -> SupadataClient:
    return SupadataClient()

@lru_cache()
def get_whisper_client() -> WhisperClient:
    return WhisperClient()

def get_transcription_orchestrator() -> TranscriptionOrchestrator:
    
    return TranscriptionOrchestrator(
        services=[
            get_supadata_client(),
        ]
    )

def get_process_job_use_case() -> ProcessJobUseCase:
    return ProcessJobUseCase(
        job_repository=get_job_repository(),
        orchestrator=get_transcription_orchestrator()
    )