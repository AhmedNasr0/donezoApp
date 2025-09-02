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
            await this.createChatTable()
            await this.createWhiteboardItemsTable()  
            await this.crateRelationTable() 
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
                resourceId VARCHAR(255),
                transcription TEXT NULL,
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
        // const query = `
        //     CREATE TABLE IF NOT EXISTS chat_messages (
        //         id VARCHAR(255) PRIMARY KEY,
        //         question TEXT NOT NULL,
        //         answer TEXT NOT NULL,
        //         context_sources TEXT[], -- PostgreSQL array type
        //         created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        //     )
        // `
        // await this.db.query(query)
        // logger.info('Chat messages table created/verified')
    }
    private async createChatTable(): Promise<void> {
        // const query = `
        //         CREATE TABLE IF NOT EXISTS chats (
        //         id VARCHAR(255) PRIMARY KEY,
        //         chat_name VARCHAR(500) NOT NULL,
        //         chat_messages JSONB DEFAULT '[]', -- array of messages,
        //         numOfConnections INT DEFAULT 0,
        //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        //         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        //     );
        //     `
        // await this.db.query(query)
        // logger.info('Chat table created/verified')
        
    }

    public async createWhiteboardItemsTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS whiteboard_items (
                id uuid primary key default gen_random_uuid(),
                type text not null,                         -- ai | youtube | tiktok | instagram | doc | image | url | social
                title text,
                content text,
                position jsonb not null default '{"x":0,"y":0}', -- { "x": number, "y": number }
                size jsonb not null default '{"width":100,"height":100}', -- { "width": number, "height": number }
                z_index int not null default 1,
                is_attached boolean not null default false,
                is_locked boolean not null default false,
                created_at timestamptz not null default now(),
                updated_at timestamptz not null default now() 
                );
            `
            await this.db.query(query)
            logger.info('Whiteboard items table created/verified')
    }

    private async crateRelationTable(): Promise<void> {
        const query = `
        CREATE TABLE IF NOT EXISTS connections (
            id VARCHAR(255) PRIMARY KEY,
            from_id uuid NOT NULL,
            from_type VARCHAR(50) NOT NULL,
            to_id uuid NOT NULL,
            to_type VARCHAR(50) NOT NULL,
            connection_type VARCHAR(50) NOT NULL DEFAULT 'association',
            label VARCHAR(255), 
            description TEXT,
            style JSON,
            bidirectional BOOLEAN DEFAULT FALSE,
            strength INTEGER DEFAULT 3 CHECK (strength >= 1 AND strength <= 5),
            metadata JSON,
            created_timestamp BIGINT NOT NULL,
            updated_timestamp BIGINT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),

            -- Foreign key constraints
            FOREIGN KEY (from_id) REFERENCES whiteboard_items(id) ON DELETE CASCADE,
            FOREIGN KEY (to_id) REFERENCES whiteboard_items(id) ON DELETE CASCADE,

            -- Prevent duplicate connections
            UNIQUE (from_id, to_id)
            );
        `
        await this.db.query(query)
        logger.info('Relation (connections) table created/verified')
    }

    

    private async createIndexes(): Promise<void> {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)',
        ]

        for (const indexQuery of indexes) {
            await this.db.query(indexQuery)
        }
        logger.info('Database indexes created/verified')
    }
}