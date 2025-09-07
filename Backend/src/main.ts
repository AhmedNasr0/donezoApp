import 'dotenv/config'
import { Server } from './presentation/server'
import { DatabaseConnection } from './infrastructure/database/connection'
import { DatabaseMigrations } from './infrastructure/database/migrations/init'
import { RedisMessageQueueService } from './infrastructure/services/RedisMessageQueueService'
import { JobRepository } from './infrastructure/repositories/supabaseJobRepositoryImp'
import { VideoRepository } from './infrastructure/repositories/supabaseVideoRepositoryImp'
import { ChatMessageRepository } from './infrastructure/repositories/supabaseChatMsgRepositoryImp'
import { ChatRepository } from './infrastructure/repositories/supabaseChatRepositoryImp'
import { ConnectionRepository } from './infrastructure/repositories/supadabaseConnectionsRepository'
import { VideoProcessingService } from './infrastructure/services/VideoProcessingService'
import { UploadVideoUseCase } from './application/use-cases/uploadVideoUseCase'
import { GetJobStatusUseCase } from './application/use-cases/GetJobStatus'
import { ChatMessageUseCase } from './application/use-cases/ChatMsgUseCase'
import { UploadController } from './presentation/controllers/uploadController'
import { StatusController } from './presentation/controllers/statusController'
import { databaseConfig, appConfig } from './infrastructure/config/init'
import { logger } from './shared/utils/logger'
import { ChatController } from './presentation/controllers/chatController'
import { ChatUseCase } from './application/use-cases/ChatUseCase'
import { ConnectionController } from './presentation/controllers/connectionController'
import { VideoStatusUseCase } from './application/use-cases/getVideoStatus'
import { LLMOrchestratorService } from "./application/services/LLMOrchestratorService";
import { GeminiService } from "./infrastructure/services/GeminiService";
import { GroqService } from "./infrastructure/services/GroqService";
import { VideoController } from './presentation/controllers/videoController'
import { VideoUseCase } from './application/use-cases/videoUseCase'
import { WhiteboardController } from './presentation/controllers/whiteboardController'
import { WhiteboardRepository } from './infrastructure/repositories/supabaseWhiteboardRepoImp'
import { UserController } from './presentation/controllers/userController'
import { WhiteboardItemRepository } from './infrastructure/repositories/supabaseWhiteboardItemRepository'
import { WhiteboardItemController } from './presentation/controllers/whiteboardItemController'
import { DeleteWhiteboardItemUseCase } from './application/use-cases/whiteboardItemUseCases/deleteWhiteboardItemUseCase'

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
        const chatMsgRepository = new ChatMessageRepository()
        const chatRepository = new ChatRepository()
        const connectionRepository = new ConnectionRepository()
        const whiteboardRepository = new WhiteboardRepository(connectionRepository)
        const whiteboardItemRepository = new WhiteboardItemRepository(connectionRepository)




        // Initialize services
        const videoProcessingService = new VideoProcessingService()
        const GeminiLLMService = new GeminiService()
        const GroqLLMService = new GroqService()
        const LLMOrchestrator = new LLMOrchestratorService(GeminiLLMService,GroqLLMService)
        

        // Initialize use cases
        const uploadVideoUseCase = new UploadVideoUseCase(
            jobRepository,
            messageQueueService
        )
        const getJobStatusUseCase = new GetJobStatusUseCase(jobRepository)
        const getVideoStatusUseCase = new VideoStatusUseCase(whiteboardItemRepository , jobRepository)
        const chatUseCase = new ChatUseCase(chatRepository,chatMsgRepository,connectionRepository,getVideoStatusUseCase,LLMOrchestrator)
        const videoUseCase = new VideoUseCase(videoRepository,connectionRepository,jobRepository)
        const chatMsgUseCase = new ChatMessageUseCase(chatMsgRepository,chatRepository,connectionRepository,getVideoStatusUseCase , LLMOrchestrator)
        const deleteWhiteboardItemUseCase = new DeleteWhiteboardItemUseCase(whiteboardItemRepository, connectionRepository)

        
        // Initialize controllers
        const uploadController = new UploadController(uploadVideoUseCase)
        const statusController = new StatusController(getJobStatusUseCase,getVideoStatusUseCase)
        const chatController = new ChatController(chatUseCase,chatMsgUseCase)
        const connectionController = new ConnectionController(connectionRepository,whiteboardItemRepository)
        const videoController = new VideoController(videoUseCase)
        const whiteboardController = new WhiteboardController(whiteboardRepository,connectionRepository,whiteboardItemRepository)
        const userController = new UserController()
        const whiteboardItemController = new WhiteboardItemController(whiteboardItemRepository,uploadVideoUseCase,deleteWhiteboardItemUseCase)


        // Initialize and start server
        const server = new Server(
            uploadController,
            statusController,
            chatController,
            connectionController,
            videoController,
            whiteboardController,
            userController,
            whiteboardItemController,
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
