import { Chat } from "../../domain/entities/chat.entity";
import { ChatMessage } from "../../domain/entities/chatMsg.entity";
import { IChatRepository } from "../../domain/repositories/IChatRepository";
import { IChatMessageRepository } from "../../domain/repositories/IChatMsgRepository";
import { IConnectionRepository } from "../../domain/repositories/IConnectionRepository";
import { CreateChatRequestDTO, UpdateChatRequestDTO } from "../dtos/ChatDTO";
import { v4 as uuidv4 } from 'uuid';
import { ChatResponseDTO } from "../dtos/chatRequestDTO";
import { VideoStatusUseCase } from "./getVideoStatus";
import { LLMOrchestratorService } from "../services/LLMOrchestratorService";

export class ChatUseCase {
    constructor(
        private chatRepository: IChatRepository,
        private chatMessageRepository: IChatMessageRepository,
        private connectionRepository: IConnectionRepository,
        private videoStatusUseCase: VideoStatusUseCase,
        private LLMOrchestratorService: LLMOrchestratorService
    ) {}

    async createChat(dto: CreateChatRequestDTO): Promise<Chat> {
         ("createChatUseCase",dto);
        const chat: Chat = {
            id: dto.id || uuidv4(),
            chat_name: dto.chat_name,
            chat_messages: [],
            numOfConnections: dto.numOfConnections || 0,
            createdAt: new Date(),
            whiteboardId: dto.whiteboardId,
            whiteboardItemId: dto.whiteboardItemId
        };


        return await this.chatRepository.createChat(chat);
    }

    async getChatById(id: string): Promise<Chat | null> {
        const chat = await this.chatRepository.getChatById(id);
        if (!chat) return null;

        const messages = await this.chatMessageRepository.findByChatId(id);
        chat.chat_messages = messages;

        return chat;
    }

    async getChatByWhiteboardItemId(whiteboardItemId: string): Promise<Chat | null> {
        const chat = await this.chatRepository.getChatByWhiteboardItemId(whiteboardItemId);
        if (!chat) return null;

        const messages = await this.chatMessageRepository.findByChatId(chat.id);
        chat.chat_messages = messages;

        return chat;
    }

    async getAllChats(): Promise<Chat[]> {
        const chats = await this.chatRepository.getAllChats();
        
        for (const chat of chats) {
            const messages = await this.chatMessageRepository.findByChatId(chat.id);
            chat.chat_messages = messages;
        }

        return chats;
    }

    async updateChat(dto: UpdateChatRequestDTO): Promise<Chat> {
        const existingChat = await this.chatRepository.getChatById(dto.id);
        if (!existingChat) {
            throw new Error('Chat not found');
        }

        const updatedChat: Chat = {
            ...existingChat,
            ...(dto.chat_name && { chat_name: dto.chat_name }),
            ...(dto.numOfConnections !== undefined && { numOfConnections: dto.numOfConnections })
        };

        return await this.chatRepository.updateChat(updatedChat);
    }

    async deleteChat(id: string): Promise<void> {

        const chat = await this.chatRepository.getChatById(id);
        if (!chat) {
            throw new Error('Chat not found');
        }

        
        await this.chatMessageRepository.deleteByChatId(id);
        
        await this.chatRepository.deleteChat(id);
        
    }

    async sendMessage(chatId: string, question: string): Promise<ChatResponseDTO> {
        const chat = await this.chatRepository.getChatById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        const userMessage = new ChatMessage(
            uuidv4(),
            chatId,
            'user',
            question,
            [],
            new Date()
        );
        await this.chatMessageRepository.save(userMessage);

        const connectionIds = await this.connectionRepository.findConnectionIdsForEntity(chat.id, 'ai');
        const contexts: string[] = [];

        for (const connectionId of connectionIds) {
            try { 
                const job = await this.videoStatusUseCase.execute(connectionId);
                if (job.status === 'done' && job.transcription) {
                    contexts.push(job.transcription);
                }
            } catch (error) { 
                console.error(`Error getting transcription for connection ${connectionId}:`, error);
            }
        }

        let answer: string;
        if (contexts.length > 0) {
            const combinedContext = contexts.join("\n--\n");
            answer = await this.LLMOrchestratorService.generateResponse(question, combinedContext);
        } else {
            answer = "no Answer"; 
        }

        const aiMessage = new ChatMessage(
            uuidv4(),
            chatId,
            'assistant',
            answer,
            contexts,
            new Date()
        );
        await this.chatMessageRepository.save(aiMessage);

        return { answer };
    }

    async getChatHistory(chatId: string): Promise<{
        messages: Array<{
            id: string;
            role: 'user' | 'assistant';
            content: string;
            context: string[];
            createdAt: Date;
        }>;
        totalMessages: number;
    }> {
        const chat = await this.chatRepository.getChatById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        const messages = await this.chatMessageRepository.findByChatId(chatId);
        
        return {
            messages: messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                context: msg.context,
                createdAt: msg.createdAt
            })),
            totalMessages: messages.length
        };
    }

    async clearChatHistory(chatId: string): Promise<void> {
        const chat = await this.chatRepository.getChatById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        await this.chatMessageRepository.deleteByChatId(chatId);
    }
}