# Video Transcription Worker Service
## Overview
#### High-performance background worker service built with FastAPI and Clean Architecture for processing video transcription jobs. Features multi-worker concurrency, provider abstraction, and enterprise-grade scalability with comprehensive connection management using PostgreSQL and Redis.

## Technologies

#### Backend: Python, FastAPI, AsyncIO
#### Database: PostgreSQL with AsyncPG connection pooling
#### Message Queue: Redis with async client
#### AI Integration: OpenAI Whisper, Supadata API
#### Architecture: Clean Architecture, SOLID principles, Repository Pattern

## Features

Multi-Worker Processing: 5 concurrent workers with async processing
Provider Abstraction: Support for multiple transcription providers (Supadata, Whisper)
Scalable Architecture: Horizontal and vertical scaling capabilities
Retry Mechanisms: Exponential backoff with configurable retry attempts
Error Handling: Robust error management with detailed logging
Queue Management: Redis-based job queue with blocking operations

## Database Schema
### Jobs Table
```
sqlCREATE TABLE jobs (
    id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    video_id VARCHAR(255),
    transcription TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions
1. Clone and Install Dependencies
bashgit clone <repository-url>
cd video_transcription_service
pip install -r requirements.txt
2. Setup PostgreSQL & Redis

### Edit config file with your configuration
DATABASE_URL=postgresql://user:password@localhost:5432/transcription_db

#### Redis
REDIS_URL=redis://localhost:6379/0
REDIS_POOL_SIZE=20
REDIS_MAX_CONNECTIONS=50

#### Queue Configuration
QUEUE_NAME=video_processing_queue

#### External APIs
SUPADATA_API_KEY=your_supadata_api_key

#### Worker Settings
WORKER_CONCURRENCY=5
MAX_RETRIES=3
RETRY_DELAY=60

## Application
APP_NAME=Video Transcription Worker
DEBUG=false
4. Initialize Database
to initialize the database and migration yo have to run the backen service first because it rely on it
5. Start Application
```
uvicorn src.main:app --reload
```

# Scale workers
you can eit thenumber of workers up to what you want then all workers will work parallel 
### easy alright ?