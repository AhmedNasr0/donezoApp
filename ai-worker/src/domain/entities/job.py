from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"

class TranscriptionProvider(str, Enum):
    SUPADATA = "supadata"
    WHISPER = "whisper"
    APIFY = "apify"

@dataclass
class Job:
    id: str
    status: JobStatus
    resourceid: Optional[str] = None
    transcription: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class Video:
    id: str
    url: str
    platform: str
    title: str
    job_id: str
    created_at: Optional[datetime] = None