import express, { Application } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { corsMiddleware } from './middlewares/cors'
import { errorHandler } from './middlewares/errorHandlers'
import { createUploadRoutes } from './routes/upload'
import { createStatusRoutes } from './routes/status'
import { createConnectionRoutes } from './routes/connection'
import { createChatRoutes } from './routes/chat'
import { UploadController } from './controllers/uploadController'
import { StatusController } from './controllers/statusController'
import { ConnectionController } from './controllers/connectionController'
import { ChatController } from './controllers/chatController'
import { logger } from '../shared/utils/logger'
import { createVideoRoutes } from './routes/video'
import { VideoController } from './controllers/videoController'
import { WhiteboardController } from './controllers/whiteboardController'
import { createWhiteboardRoutes } from './routes/whiteboard'
import { UserController } from './controllers/userController'
import { createUserRoutes } from './routes/user'
import { createWhiteboardItemRoutes } from './routes/whiteboardItem'
import { WhiteboardItemController } from './controllers/whiteboardItemController'
import { create } from 'domain'
export class Server {
    private app: Application
    private port: number

    constructor(
        private uploadController: UploadController,
        private statusController: StatusController,
        private chatController: ChatController,
        private connectionController: ConnectionController,
        private videoController: VideoController,
        private whiteboardController : WhiteboardController,
        private userController : UserController,
        private whiteboardItemController : WhiteboardItemController,
        port: number = 3000
    ) {
        this.app = express()
        this.port = port
        this.setupMiddleware()
        this.setupRoutes()
        this.setupErrorHandling()
    }

    private setupMiddleware(): void {
        this.app.use(helmet())
        this.app.use(corsMiddleware)


        this.app.use(express.json({ limit: '10mb' }))
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                message: 'Server is running',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            })
        })
    }

    private setupRoutes(): void {
        const apiPrefix = '/api/v1'

        this.app.use(`${apiPrefix}/upload`, createUploadRoutes(this.uploadController))
        this.app.use(`${apiPrefix}/status`, createStatusRoutes(this.statusController))
        this.app.use(`${apiPrefix}/connections`, createConnectionRoutes(this.connectionController))
        this.app.use(`${apiPrefix}/chat`, createChatRoutes(this.chatController))
        this.app.use(`${apiPrefix}/video`, createVideoRoutes(this.videoController))
        this.app.use(`${apiPrefix}/whiteboard`, createWhiteboardRoutes(this.whiteboardController))
        this.app.use(`${apiPrefix}/users`,createUserRoutes(this.userController))
        this.app.use(`${apiPrefix}/whiteboard-item`, createWhiteboardItemRoutes(this.whiteboardItemController))



        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.originalUrl} not found`
            })
        })
    }

    private setupErrorHandling(): void {
        this.app.use(errorHandler)
    }

    public start(): void {
        this.app.listen(this.port, () => {
            logger.info(`Server is running on port ${this.port}`)
            logger.info(`Health check available at: http://localhost:${this.port}/health`)
            logger.info(`API documentation: http://localhost:${this.port}/api/v1`)
        })
    }

    public getApp(): Application {
        return this.app
    }
}