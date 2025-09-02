import { Chat } from "../entities/chat.entity";
import {Video} from '../entities/video.entity'

export interface IChatRepository{
    createChat: (chat: Chat) => Promise<Chat>;
    getChatById: (id: string) => Promise<Chat|null>;
    updateChat: (chat: Chat) => Promise<Chat>
    deleteChat: (id: string) => Promise<void>,
    getAllChats: () => Promise<Chat[]>;
}