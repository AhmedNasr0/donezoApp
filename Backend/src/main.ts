import 'dotenv/config'
import { Server } from './presentation/server'
import { DatabaseConnection } from './infrastructure/database/connection'
import { DatabaseMigrations } from './infrastructure/database/migrations/init'
import { RedisMessageQueueService } from './infrastructure/services/RedisMessageQueueService'
import { JobRepository } from './infrastructure/repositories/JobRepositoryImp'
import { VideoRepository } from './infrastructure/repositories/videoRepositoryImp'
import { ChatRepository } from './infrastructure/repositories/chatRepositoryImp'
import { VideoProcessingService } from './infrastructure/services/VideoProcessingService'
import { OpenAIChatService } from './infrastructure/services/OpenAIChatService'
import { UploadVideoUseCase } from './application/use-cases/uploadVideoUseCase'
import { GetJobStatusUseCase } from './application/use-cases/GetJobStatus'
import { ChatUseCase } from './application/use-cases/ChatUseCase'
import { UploadController } from './presentation/controllers/uploadController'
import { StatusController } from './presentation/controllers/statusController'
import { ChatController } from './presentation/controllers/chatController'
import { databaseConfig, appConfig } from './infrastructure/config/init'
import { logger } from './shared/utils/logger'

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
        const chatRepository = new ChatRepository()

        // Initialize services
        const videoProcessingService = new VideoProcessingService()
        const chatService = new OpenAIChatService()

        // Initialize use cases
        const uploadVideoUseCase = new UploadVideoUseCase(
            jobRepository,
            videoRepository,
            messageQueueService
        )
        const getJobStatusUseCase = new GetJobStatusUseCase(jobRepository)
        const chatUseCase = new ChatUseCase(chatRepository, jobRepository, chatService)

        // Initialize controllers
        const uploadController = new UploadController(uploadVideoUseCase)
        const statusController = new StatusController(getJobStatusUseCase)
        const chatController = new ChatController(chatUseCase)

        // Initialize and start server
        const server = new Server(
            uploadController,
            statusController,
            chatController,
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
