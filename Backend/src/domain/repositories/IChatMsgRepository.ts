import { ChatMessage } from '../entities/chatMsg.entity'


export interface IChatMsgRepository {
    save(chatMessage: ChatMessage): Promise<void>
    findById(id: string): Promise<ChatMessage | null>
    findRecent(limit: number): Promise<ChatMessage[]>
}