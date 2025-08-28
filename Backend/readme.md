# Backend API with PostgreSQL

## Overview
Scalable backend API built with Clean Architecture for processing video transcriptions using PostgreSQL as the primary database.

## Technologies
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with native pg driver
- **Message Queue**: Redis
- **Architecture**: Clean Architecture, SOLID principles

## Database Schema

### Jobs Table
```sql
CREATE TABLE jobs (
    id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    video_id VARCHAR(255),
    transcription TEXT,
    error TEXT
);
```

### Videos Table
```sql
CREATE TABLE videos (
    id VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    platform VARCHAR(50) CHECK (platform IN ('youtube', 'tiktok', 'instagram')),
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id VARCHAR(255) REFERENCES jobs(id) ON DELETE CASCADE
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    context_sources TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup PostgreSQL
```bash
# Using Docker
docker run --name postgres-video -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=video_transcription -p 5432:5432 -d postgres:15

# Or using Docker Compose
docker-compose up -d postgres redis
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Initialize Database
```bash
npm run ts-node src/scripts/setup-db.ts
```

### 5. Start Application
```bash
npm run dev
```

## API Endpoints

### Upload Video
**POST** `/api/v1/upload`
```json
{
  "url": "https://youtube.com/watch?v=example",
  "platform": "youtube",
  "title": "Video Title"
}
```

### Get Job Status
**GET** `/api/v1/status/:jobId`

### Get All Jobs
**GET** `/api/v1/status`

### Chat
**POST** `/api/v1/chat`
```json
{
  "question": "What was discussed in the videos?"
}
```

## Development Commands
```bash
npm run dev      # Development mode
npm run build    # Build TypeScript
npm start        # Production mode
npm run db:init  # Initialize database