# Backend API with PostgreSQL

## Overview
Scalable backend API built with Clean Architecture for processing video transcriptions and managing real-time chat conversations with AI, featuring comprehensive connection management between entities using PostgreSQL as the primary database.

## Technologies
* **Backend**: Node.js, Express.js, TypeScript
* **Database**: PostgreSQL with native pg driver
* **Message Queue**: Redis
* **AI Integration**: OpenAI API
* **Architecture**: Clean Architecture, SOLID principles, Repository Pattern
* **Validation**: Custom middleware validation
* **Security**: Helmet, CORS, Rate limiting

## Features
* **Video Processing**: Upload and transcribe videos from multiple platforms
* **AI Chat System**: Intelligent conversations based on video content
* **Connection Management**: Link users, chats, and videos dynamically
* **Chat Management**: Create, update, and manage chat conversations
* **Real-time Status**: Track job processing status
* **Error Handling**: Comprehensive error management
* **Rate Limiting**: Protection against abuse

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

### Connections Table
```sql
CREATE TABLE connections (
    id VARCHAR(255) PRIMARY KEY,
    fromId VARCHAR(255) NOT NULL,
    fromType VARCHAR(50) NOT NULL CHECK (fromType IN ('user', 'video', 'chat', 'job')),
    toId VARCHAR(255) NOT NULL,
    toType VARCHAR(50) NOT NULL CHECK (toType IN ('user', 'video', 'chat', 'job')),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Chat Table
```sql
CREATE TABLE Chat (
    id VARCHAR(255) PRIMARY KEY,
    chat_name VARCHAR(255) NOT NULL,
    chat_messages JSONB DEFAULT '[]',
    numOfConnections INTEGER DEFAULT 0
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup PostgreSQL & Redis
```bash
# Using Docker
docker run --name postgres-video -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=video_transcription -p 5432:5432 -d postgres:15

docker run --name redis-video -p 6379:6379 -d redis:alpine

# Or using Docker Compose
docker-compose up -d postgres redis
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/video_transcription

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret
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

### Health Check
**GET** `/health`
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345.67
}
```

### Video Processing

#### Upload Video
**POST** `/api/v1/upload`
```json
{
  "url": "https://youtube.com/watch?v=example",
  "platform": "youtube",
  "title": "Video Title"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "uuid-job-id",
    "videoId": "uuid-video-id",
    "status": "pending",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Video uploaded successfully"
}
```

#### Get Job Status
**GET** `/api/v1/status/:jobId`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-job-id",
    "status": "completed",
    "progress": 100,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z",
    "error": null
  }
}
```

### AI Chat System

#### Send Chat Message
**POST** `/api/v1/chat`
```json
{
  "question": "What was discussed in the videos?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "What was discussed in the videos?",
    "answer": "Based on the video transcriptions...",
    "contextSources": 3,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Connection Management

#### Create Connection
**POST** `/api/v1/connections`
```json
{
  "fromId": "user-123",
  "fromType": "user",
  "toId": "chat-456",
  "toType": "chat"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-connection-id",
    "fromId": "user-123",
    "fromType": "user",
    "toId": "chat-456",
    "toType": "chat",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Connection created successfully"
}
```

#### Get All Connections
**GET** `/api/v1/connections`

#### Get Entity Connections
**GET** `/api/v1/connections/entity?entityId=user-123&entityType=user`

#### Update Connection
**PUT** `/api/v1/connections/:id`

#### Delete Connection
**DELETE** `/api/v1/connections/:id`

#### Disconnect Entities
**POST** `/api/v1/connections/disconnect`
```json
{
  "fromId": "user-123",
  "toId": "chat-456"
}
```

### Chat Management

#### Create Chat
**POST** `/api/v1/chats`
```json
{
  "chat_name": "Project Discussion",
  "numOfConnections": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-chat-id",
    "chat_name": "Project Discussion",
    "chat_messages": [],
    "numOfConnections": 0
  },
  "message": "Chat created successfully"
}
```

#### Get All Chats
**GET** `/api/v1/chats`

#### Get Chat by ID
**GET** `/api/v1/chats/:id`

#### Update Chat
**PUT** `/api/v1/chats/:id`

#### Delete Chat
**DELETE** `/api/v1/chats/:id`

#### Add Message to Chat
**POST** `/api/v1/chats/:id/messages`
```json
{
  "message": {
    "content": "Hello team!",
    "sender": "user-123",
    "type": "text"
  }
}
```

## Project Structure
```
src/
├── application/
│   ├── dtos/
│   │   ├── chatRequestDTO.ts
│   │   ├── ConnectionRequestDTO.ts
│   │   └── ChatRequestDTO.ts
│   └── use-cases/
│       ├── uploadVideoUseCase.ts
│       ├── GetJobStatus.ts
│       ├── ChatMsgUseCase.ts
│       ├── ConnectionUseCase.ts
│       └── ChatUseCase.ts
├── domain/
│   ├── entities/
│   │   ├── video.entity.ts
│   │   ├── job.entity.ts
│   │   ├── connection.entity.ts
│   │   └── chat.entity.ts
│   └── repositories/
│       ├── IVideoRepository.ts
│       ├── IJobRepository.ts
│       ├── IConnectionRepository.ts
│       └── IChatRepository.ts
├── infrastructure/
│   ├── config/
│   ├── database/
│   │   ├── connection.ts
│   │   └── migrations/
│   ├── repositories/
│   │   ├── videoRepositoryImp.ts
│   │   ├── JobRepositoryImp.ts
│   │   ├── ConnectionRepositoryImp.ts
│   │   └── ChatRepositoryImp.ts
│   └── services/
│       ├── VideoProcessingService.ts
│       ├── OpenAIChatService.ts
│       └── RedisMessageQueueService.ts
├── presentation/
│   ├── controllers/
│   │   ├── uploadController.ts
│   │   ├── statusController.ts
│   │   ├── chatMsgController.ts
│   │   ├── ConnectionController.ts
│   │   └── ChatController.ts
│   ├── middlewares/
│   │   ├── cors.ts
│   │   ├── errorHandlers.ts
│   │   └── validations.ts
│   ├── routes/
│   │   ├── upload.ts
│   │   ├── status.ts
│   │   ├── chatMsg.ts
│   │   ├── connection.ts
│   │   └── chatManagement.ts
│   └── server.ts
├── shared/
│   ├── errors/
│   └── utils/
└── main.ts
```

## Error Responses

### Common Error Formats
```json
// 400 Bad Request
{
  "success": false,
  "message": "Validation error message"
}

// 404 Not Found
{
  "success": false,
  "message": "Resource not found"
}

// 429 Too Many Requests
{
  "success": false,
  "message": "Too many requests, please try again later"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Internal server error"
}
```

## Development Commands
```bash
npm run dev         # Development mode with hot reload
npm run build       # Build TypeScript to JavaScript
npm start           # Production mode
npm run db:init     # Initialize database with migrations
npm run db:migrate  # Run database migrations
npm run test        # Run tests
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## Usage Examples

### 1. Complete Workflow Example
```bash
# 1. Upload a video
curl -X POST http://localhost:3000/api/v1/upload \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://youtube.com/watch?v=example",
    "platform": "youtube",
    "title": "Educational Video"
  }'

# 2. Check processing status
curl http://localhost:3000/api/v1/status/job-id-here

# 3. Create a chat for discussion
curl -X POST http://localhost:3000/api/v1/chats \
  -H "Content-Type: application/json" \
  -d '{
    "chat_name": "Video Discussion",
    "numOfConnections": 0
  }'

# 4. Connect user to chat
curl -X POST http://localhost:3000/api/v1/connections \
  -H "Content-Type: application/json" \
  -d '{
    "fromId": "user-123",
    "fromType": "user",
    "toId": "chat-456",
    "toType": "chat"
  }'

# 5. Add message to chat
curl -X POST http://localhost:3000/api/v1/chats/chat-456/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "content": "What are the key points in this video?",
      "sender": "user-123",
      "type": "text"
    }
  }'

# 6. Chat with AI about the video
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Summarize the main topics discussed in the uploaded video"
  }'
```

### 2. Connection Management Examples
```bash
# Get all connections for a user
curl "http://localhost:3000/api/v1/connections/entity?entityId=user-123&entityType=user"

# Get all connections
curl http://localhost:3000/api/v1/connections

# Disconnect entities
curl -X POST http://localhost:3000/api/v1/connections/disconnect \
  -H "Content-Type: application/json" \
  -d '{
    "fromId": "user-123",
    "toId": "chat-456"
  }'
```

## Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Response**: 429 Too Many Requests

## Security Features
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Request validation middleware
- **Error Handling**: Secure error responses

## Performance Considerations
- **Connection Pooling**: PostgreSQL connection management
- **Redis Caching**: Fast data retrieval
- **Async Processing**: Non-blocking operations
- **Clean Architecture**: Separation of concerns
- **TypeScript**: Type safety and better development experience

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Run the test suite
6. Create a pull request

## License
MIT License - see LICENSE file for details