from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# حمل القيم من .env
load_dotenv()

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL") or "postgresql://taskdb_k6cv_user:6dCazhg5QpbS70dLImDxI4p0DqS6wOa3@dpg-d2ohb324d50c739ue2o0-a.oregon-postgres.render.com/taskdb_k6cv"
    
    redis_url: str = os.getenv("REDIS_URL") or "rediss://red-d2ohqaggjchc73ep7oo0:91qTkwnGS1APbmiIWDjrRGEI35RA5rYk@oregon-keyvalue.render.com:6379"
    redis_pool_size: int = 20
    redis_max_connections: int = 50
    
    queue_name: str = "video_processing"
    
    supadata_api_key: str = "sd_a9bec6cb9d617c2e028e834cfd7a9033"
    
    app_name: str = "Video Transcription Worker"
    debug: bool = False
    
    # Worker Settings
    worker_concurrency: int = 5 
    max_retries: int = 3
    retry_delay: int = 60  
    
    class Config:
        env_file = ".env"

settings = Settings()