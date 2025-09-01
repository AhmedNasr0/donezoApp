import 'dotenv/config'
import { Server } from './presentation/server'
import { DatabaseConnection } from './infrastructure/database/connection'
import { DatabaseMigrations } from './infrastructure/database/migrations/init'
import { RedisMessageQueueService } from './infrastructure/services/RedisMessageQueueService'
import { JobRepository } from './infrastructure/repositories/JobRepositoryImp'
import { VideoRepository } from './infrastructure/repositories/videoRepositoryImp'
import { ChatMsgRepository } from './infrastructure/repositories/chatMsgRepositoryImp'
import { ChatRepository } from './infrastructure/repositories/chatRepositoryImp'
import { ConnectionRepository } from './infrastructure/repositories/connectionsRepository'
import { VideoProcessingService } from './infrastructure/services/VideoProcessingService'
import { UploadVideoUseCase } from './application/use-cases/uploadVideoUseCase'
import { GetJobStatusUseCase } from './application/use-cases/GetJobStatus'
import { ChatMsgUseCase } from './application/use-cases/ChatMsgUseCase'
import { UploadController } from './presentation/controllers/uploadController'
import { StatusController } from './presentation/controllers/statusController'
import { ChatMsgController } from './presentation/controllers/chatMsgController'
import { databaseConfig, appConfig } from './infrastructure/config/init'
import { logger } from './shared/utils/logger'
import { ChatController } from './presentation/controllers/chatController'
import { ChatUseCase } from './application/use-cases/chatUseCase'
import { ConnectionUseCase } from './application/use-cases/connectionUseCases'
import { ConnectionController } from './presentation/controllers/connectionController'
import { VideoStatusUseCase } from './application/use-cases/getVideoStatus'
import { LLMOrchestratorService } from "./application/services/LLMOrchestratorService";
import { GeminiService } from "./infrastructure/services/GeminiService";
import { GroqService } from "./infrastructure/services/GroqService";
import { get } from 'http'
import { VideoController } from './presentation/controllers/videoController'
import { VideoUseCase } from './application/use-cases/videoUseCase'

async function bootstrap(): Promise<void> {
    try {
        logger.info('Starting application...')

        // Initialize database connection
        const database = DatabaseConnection.getInstance()
        console.log("currentUrl",databaseConfig.postgresUrl)
        await database.connect(databaseConfig.postgresUrl)

        // Run database migrations
        const migrations = new DatabaseMigrations()
        await migrations.runInitialMigrations()

        // Initialize Redis message queue
        const messageQueueService = new RedisMessageQueueService()
        await messageQueueService.connect()

        // Initialize repositories
        const jobRepository = new JobRepository()
        const videoRepository = new VideoRepository()
        const chatMsgRepository = new ChatMsgRepository()
        const chatRepository = new ChatRepository()
        const connectionRepository = new ConnectionRepository()


        // Initialize services
        const videoProcessingService = new VideoProcessingService()
        const GeminiLLMService = new GeminiService()
        const GroqLLMService = new GroqService()
        const LLMOrchestrator = new LLMOrchestratorService(GeminiLLMService,GroqLLMService)
        

        // Initialize use cases
        const uploadVideoUseCase = new UploadVideoUseCase(
            jobRepository,
            videoRepository,
            messageQueueService
        )
        const getJobStatusUseCase = new GetJobStatusUseCase(jobRepository)
        const chatMsgUseCase = new ChatMsgUseCase(chatMsgRepository, jobRepository, LLMOrchestrator)
        const connectionUseCase = new ConnectionUseCase(connectionRepository)
        const getVideoStatusUseCase = new VideoStatusUseCase(videoRepository , jobRepository)
        const chatUseCase = new ChatUseCase(chatRepository,connectionRepository,getVideoStatusUseCase,LLMOrchestrator)
        const videoUseCase = new VideoUseCase(videoRepository,connectionRepository,jobRepository)
        
        // Initialize controllers
        const uploadController = new UploadController(uploadVideoUseCase)
        const statusController = new StatusController(getJobStatusUseCase,getVideoStatusUseCase)
        const chatMsgController = new ChatMsgController(chatMsgUseCase)
        const chatController = new ChatController(chatUseCase)
        const connectionController = new ConnectionController(connectionUseCase)
        const videoController = new VideoController(videoUseCase)

        // Initialize and start server
        const server = new Server(
            uploadController,
            statusController,
            chatController,
            chatMsgController,
            connectionController,
            videoController,
            appConfig.port
        )

        server.start()

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received, shutting down gracefully...')
            await database.disconnect()
            await messageQueueService.disconnect()
            process.exit(0)
        })

        process.on('SIGINT', async () => {
            logger.info('SIGINT received, shutting down gracefully...')
            await database.disconnect()
            await messageQueueService.disconnect()
            process.exit(0)
        })

        logger.info('Application started successfully')
    } catch (error) {
        logger.error('Failed to start application:', error)
        process.exit(1)
    }
}

bootstrap()
