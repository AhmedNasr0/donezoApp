import { ChatMessage } from '../../domain/entities/chat.entity'


export interface IChatRepository {
    save(chatMessage: ChatMessage): Promise<void>
    findById(id: string): Promise<ChatMessage | null>
    findRecent(limit: number): Promise<ChatMessage[]>
}