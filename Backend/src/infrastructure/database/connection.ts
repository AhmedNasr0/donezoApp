import { Pool, PoolClient } from 'pg'
import { logger } from '../../shared/utils/logger'

export class DatabaseConnection {
    private static instance: DatabaseConnection
    private pool: Pool | null = null
    private isConnected: boolean = false

    private constructor() {}

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection()
        }
        return DatabaseConnection.instance
    }

    public async connect(connectionString: string): Promise<void> {
        if (this.isConnected) {
            return
        }

        try {
            this.pool = new Pool({
                connectionString,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
                ssl: {
                    rejectUnauthorized: false,
                },
            })

            // Test connection
            const client = await this.pool.connect()
            await client.query('SELECT NOW()')
            client.release()
            
            this.isConnected = true
            logger.info('PostgreSQL connected successfully')
        } catch (error) {
            logger.error('Database connection failed:', error)
            throw error
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected || !this.pool) {
            return
        }

        try {
            await this.pool.end()
            this.pool = null
            this.isConnected = false
            logger.info('Database disconnected successfully')
        } catch (error) {
            logger.error('Database disconnection failed:', error)
            throw error
        }
    }

    public getPool(): Pool {
        if (!this.pool) {
            throw new Error('Database not connected')
        }
        return this.pool
    }

    public async getClient(): Promise<PoolClient> {
        if (!this.pool) {
            throw new Error('Database not connected')
        }
        return await this.pool.connect()
    }

    public async query(text: string, params?: any[]): Promise<any> {
        if (!this.pool) {
            throw new Error('Database not connected')
        }
        
        const start = Date.now()
        try {
            const res = await this.pool.query(text, params)
            const duration = Date.now() - start
            logger.debug(`Executed query in ${duration}ms: ${text}`)
            return res
        } catch (error) {
            logger.error('Query error:', { text, params, error })
            throw error
        }
    }
}