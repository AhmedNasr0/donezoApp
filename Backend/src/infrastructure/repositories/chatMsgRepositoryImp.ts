import { IChatMsgRepository } from '../../domain/repositories/IChatMsgRepository'
import { ChatMessage } from '../../domain/entities/chatMsg.entity'
import { DatabaseConnection } from '../database/connection'

export class ChatMsgRepository implements IChatMsgRepository {
    private db: DatabaseConnection

    constructor() {
        this.db = DatabaseConnection.getInstance()
    }

    async save(chatMessage: ChatMessage): Promise<void> {
        const query = `
            INSERT INTO chat_messages (id, question, answer, context_sources, created_at)
            VALUES ($1, $2, $3, $4, $5)
        `
        const values = [
            chatMessage.id,
            chatMessage.question,
            chatMessage.answer,
            chatMessage.context, // PostgreSQL will handle the array
            chatMessage.createdAt
        ]
        
        await this.db.query(query, values)
    }

    async findById(id: string): Promise<ChatMessage | null> {
        const query = 'SELECT * FROM chat_messages WHERE id = $1'
        const result = await this.db.query(query, [id])
        
        if (result.rows.length === 0) {
            return null
        }

        const row = result.rows[0]
        return new ChatMessage(
            row.id,
            row.question,
            row.answer,
            row.context_sources || [],
            new Date(row.created_at)
        )
    }

    async findRecent(limit: number): Promise<ChatMessage[]> {
        const query = 'SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT $1'
        const result = await this.db.query(query, [limit])
        
        return result.rows.map((row: any) => new ChatMessage(
            row.id,
            row.question,
            row.answer,
            row.context_sources || [],
            new Date(row.created_at)
        ))
    }
}
