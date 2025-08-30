import { Chat } from "../../domain/entities/chat.entity";
import { IChatRepository } from "../../domain/repositories/IChatRepository";
import { DatabaseConnection } from "../database/connection";


export class ChatRepository implements IChatRepository {
    private db : DatabaseConnection
    constructor(    
    ) {
        this.db = DatabaseConnection.getInstance()
    }
    async getAllChats() : Promise<Chat[]>{
        const query = `
            SELECT * FROM chats
        `
        const result = await this.db.query(query)
        return result.rows as Chat[]
    }

    async createChat(chat: Chat) : Promise<Chat>{
        const query = `
            INSERT INTO chats (id, chat_name, chat_messages, numOfConnections)
            VALUES ($1, $2, $3, $4)
        `
        const values = [
            chat.id,
            chat.chat_name,
            JSON.stringify(chat.chat_messages),
            chat.numOfConnections
        ]
        await this.db.query(query, values)
        return chat
    };
    async getChatById(id: string):Promise<Chat>{
        const query = `
            SELECT * FROM chats WHERE id = $1
        `
        const values = [id]
        const result = await this.db.query(query, values)
        return result.rows[0] as Chat
    }
    async updateChat(chat: Chat) : Promise<Chat>{
        const query = `
            UPDATE chats SET chat_name = $1, chat_messages = $2, numOfConnections = $3 WHERE id = $4
        `
        const values = [
            chat.chat_name,
            chat.chat_messages,
            chat.numOfConnections,
            chat.id
        ]
        await this.db.query(query, values)
        return chat
    }
    async deleteChat (id: string) : Promise<void>{
        const query = `
            DELETE FROM chats WHERE id = $1
        `
        const values = [id]
        await this.db.query(query, values)
        return 
    }
}