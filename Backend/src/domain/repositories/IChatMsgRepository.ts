import { ChatMessage } from "../entities/chatMsg.entity";

export interface IChatMessageRepository {
    save(chatMessage: ChatMessage): Promise<ChatMessage>;
    findById(id: string): Promise<ChatMessage | null>;
    findByChatId(chatId: string): Promise<ChatMessage[]>;
    findRecent(limit: number): Promise<ChatMessage[]>;
    deleteById(id: string): Promise<void>;
    deleteByChatId(chatId: string): Promise<void>;
    update(chatMessage: ChatMessage): Promise<ChatMessage>;
}