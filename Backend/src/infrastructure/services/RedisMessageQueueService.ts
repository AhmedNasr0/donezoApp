import { createClient, RedisClientType } from 'redis'
import { IMessageQueueService } from '../../domain/services/IMessageQueueService'
import { logger } from '../../shared/utils/logger'

export class RedisMessageQueueService implements IMessageQueueService {
    private client: RedisClientType | null = null

    async connect(): Promise<void> {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        })

        this.client.on('error', (err) => {
            logger.error('Redis Client Error:', err)
        })

        await this.client.connect()
        logger.info('Connected to Redis')
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit()
            this.client = null
            logger.info('Disconnected from Redis')
        }
    }

    async sendToQueue(queueName: string, data: any): Promise<void> {
        if (!this.client) {
            throw new Error('Redis client not connected')
        }

        await this.client.lPush(queueName, JSON.stringify(data))
        logger.info(`Message sent to queue ${queueName}:`, data)
    }
}
