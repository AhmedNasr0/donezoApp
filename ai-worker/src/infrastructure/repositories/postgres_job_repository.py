import asyncpg
from typing import Optional, Tuple
from datetime import datetime
import logging

from src.domain.entities.job import Job, JobStatus
from src.domain.repositories.job_repository import JobRepository
from src.infrastructure.database.postgres_connection import database_connection

logger = logging.getLogger(__name__)

class PostgresJobRepository(JobRepository):
    
    async def get_by_id(self, job_id: str) -> Optional[Job]:
        pool = database_connection.get_pool()
        
        async with pool.acquire() as connection:
            query = """
                SELECT id, status, video_id, transcription, error, created_at, updated_at
                FROM jobs 
                WHERE id = $1
            """
            row = await connection.fetchrow(query, job_id)
            
            if not row:
                return None
            
            return Job(
                id=row['id'],
                status=JobStatus(row['status']),
                video_id=row['video_id'],
                transcription=row['transcription'],
                error=row['error'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
    
    async def get_video_url_by_job_id(self, job_id: str) -> Optional[str]:
        pool = database_connection.get_pool()
        
        async with pool.acquire() as connection:
            query = """
                SELECT v.url 
                FROM videos v 
                WHERE v.job_id = $1
            """
            row = await connection.fetchrow(query, job_id)
            return row['url'] if row else None
    
    async def get_job_with_video(self, job_id: str) -> Optional[Tuple[Job, str]]:
        pool = database_connection.get_pool()
        
        async with pool.acquire() as connection:
            query = """
                SELECT j.id, j.status, j.video_id, j.transcription, j.error, 
                       j.created_at, j.updated_at, v.url
                FROM jobs j
                JOIN videos v ON v.job_id = j.id
                WHERE j.id = $1
            """
            row = await connection.fetchrow(query, job_id)
            
            if not row:
                return None
            
            job = Job(
                id=row['id'],
                status=JobStatus(row['status']),
                video_id=row['video_id'],
                transcription=row['transcription'],
                error=row['error'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            
            return job, row['url']
    
    async def update_job_status(self, jobId: str, status: JobStatus, 
                                transcription: Optional[str] = None,
                                error: Optional[str] = None) -> bool:
        pool = database_connection.get_pool()
        
        async with pool.acquire() as connection:
            # Build dynamic query based on provided parameters
            set_clauses = ["status = $2", "updated_at = $3"]
            params = [jobId, status.value, datetime.utcnow()]
            param_count = 3
            
            if transcription is not None:
                param_count += 1
                set_clauses.append(f"transcription = ${param_count}")
                params.append(transcription)
            
            if error is not None:
                param_count += 1
                set_clauses.append(f"error = ${param_count}")
                params.append(error)
            
            query = f"""
                UPDATE jobs 
                SET {', '.join(set_clauses)}
                WHERE id = $1
            """
            
            result = await connection.execute(query, *params)
            return result == "UPDATE 1"
