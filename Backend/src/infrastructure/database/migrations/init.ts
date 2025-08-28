import { DatabaseConnection } from '../connection'
import { logger } from '../../../shared/utils/logger'

export class DatabaseMigrations {
    private db: DatabaseConnection

    constructor() {
        this.db = DatabaseConnection.getInstance()
    }

    public async runInitialMigrations(): Promise<void> {
        try {
            logger.info('Starting database migrations...')

            await this.createJobsTable()
            await this.createVideosTable()
            await this.createChatMessagesTable()
            await this.createIndexes()

            logger.info('Database migrations completed successfully')
        } catch (error) {
            logger.error('Migration failed:', error)
            throw error
        }
    }

    private async createJobsTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS jobs (
                id VARCHAR(255) PRIMARY KEY,
                status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'done', 'failed')),
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                video_id VARCHAR(255),
                transcription TEXT,
                error TEXT
            )
        `
        await this.db.query(query)
        logger.info('Jobs table created/verified')
    }

    private async createVideosTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS videos (
                id VARCHAR(255) PRIMARY KEY,
                url TEXT NOT NULL,
                platform VARCHAR(50) NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram')),
                title VARCHAR(500) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                job_id VARCHAR(255),
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            )
        `
        await this.db.query(query)
        logger.info('Videos table created/verified')
    }

    private async createChatMessagesTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS chat_messages (
                id VARCHAR(255) PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                context_sources TEXT[], -- PostgreSQL array type
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            )
        `
        await this.db.query(query)
        logger.info('Chat messages table created/verified')
    }

    private async createIndexes(): Promise<void> {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_videos_job_id ON videos(job_id)',
            'CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform)',
            'CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)'
        ]

        for (const indexQuery of indexes) {
            await this.db.query(indexQuery)
        }
        logger.info('Database indexes created/verified')
    }
}