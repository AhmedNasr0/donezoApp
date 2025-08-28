import express, { Application } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { corsMiddleware } from './middlewares/cors'
import { errorHandler } from './middlewares/errorHandlers'
import { createUploadRoutes } from './routes/upload'
import { createStatusRoutes } from './routes/status'
import { createChatRoutes } from './routes/chat'
import { UploadController } from './controllers/uploadController'
import { StatusController } from './controllers/statusController'
import { ChatController } from './controllers/chatController'
import { logger } from '../shared/utils/logger'

export class Server {
    private app: Application
    private port: number

    constructor(
        private uploadController: UploadController,
        private statusController: StatusController,
        private chatController: ChatController,
        port: number = 3000
    ) {
        this.app = express()
        this.port = port
        this.setupMiddleware()
        this.setupRoutes()
        this.setupErrorHandling()
    }

    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet())
        this.app.use(corsMiddleware)

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: {
                success: false,
                message: 'Too many requests, please try again later'
            }
        })
        this.app.use(limiter)

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }))
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

        // Health check
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
        this.app.use(`${apiPrefix}/chat`, createChatRoutes(this.chatController))

        // 404 handler
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