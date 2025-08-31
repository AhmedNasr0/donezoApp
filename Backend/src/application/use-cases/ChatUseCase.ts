import { Chat } from "../../domain/entities/chat.entity";
import { ChatMessage } from "../../domain/entities/chatMsg.entity";
import { IChatRepository } from "../../domain/repositories/IChatRepository";
import { IConnectionRepository } from "../../domain/repositories/IConnectionRepository";
import { CreateChatRequestDTO, UpdateChatRequestDTO } from "../dtos/ChatDTO";
import { v4 as uuidv4 } from 'uuid';
import { ChatResponseDTO } from "../dtos/chatRequestDTO";
import { VideoStatusUseCase } from "./getVideoStatus";
import { LLMOrchestratorService } from "../services/LLMOrchestratorService";
export class ChatUseCase {
    constructor(
        private chatRepository: IChatRepository,
        private connectionRepository: IConnectionRepository,
        private videoStatusUseCase: VideoStatusUseCase,
        private LLMOrchestratorService: LLMOrchestratorService
    ) {}

    async createChat(dto: CreateChatRequestDTO): Promise<Chat> {
        const chat: Chat = {
            id: uuidv4(),
            chat_name: dto.chat_name,
            chat_messages: dto.chat_messages || [],
            numOfConnections: dto.numOfConnections || 0
        };

        return await this.chatRepository.createChat(chat);
    }

    async getChatById(id: string): Promise<Chat | null> {
        return await this.chatRepository.getChatById(id);
    }

    async getAllChats(): Promise<Chat[]> {
        return await this.chatRepository.getAllChats();
    }

    async updateChat(dto: UpdateChatRequestDTO): Promise<Chat> {
        const existingChat = await this.chatRepository.getChatById(dto.id);
        if (!existingChat) {
            throw new Error('Chat not found');
        }

        const updatedChat: Chat = {
            ...existingChat,
            ...(dto.chat_name && { chat_name: dto.chat_name }),
            ...(dto.chat_messages && { chat_messages: dto.chat_messages }),
            ...(dto.numOfConnections !== undefined && { numOfConnections: dto.numOfConnections })
        };

        return await this.chatRepository.updateChat(updatedChat);
    }

    async deleteChat(id: string): Promise<void> {
        const chat = await this.chatRepository.getChatById(id);
        if (!chat) {
            throw new Error('Chat not found');
        }
        await this.chatRepository.deleteChat(id);
    }

    async addMessageToChat(chatId: string, message: any): Promise<Chat> {
        const chat = await this.chatRepository.getChatById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        const updatedMessages = [...chat.chat_messages, message];
        
        return await this.chatRepository.updateChat({
            ...chat,
            chat_messages: updatedMessages
        });
    }

    async sendMessage(chatId: string, question: string): Promise<ChatResponseDTO> {
        const chat = await this.chatRepository.getChatById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }
    
        const connectionIds = await this.connectionRepository.findConnectionIdsForEntity(chat.id, 'ai');
    
        const contexts: string[] = [];
    
        for (const connectionId of connectionIds) {
            const job = await this.videoStatusUseCase.execute(connectionId);
    
            if (job.status === 'done') {
                if(job.transcription)  { 
                    contexts.push(job.transcription); 
                }
            }
        }
    
        if (contexts.length > 0) {
            const combinedContext = contexts.join("\n--\n");
            const answer = await this.LLMOrchestratorService.generateResponse(question, combinedContext);
            console.log("answer :",answer)
            return { answer };
        } else {
            return { answer: "no Answer" };
        }
    }
    
}
