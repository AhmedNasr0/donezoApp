import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../../domain/entities/chatMsg.entity';
import { IChatMessageRepository } from '../../domain/repositories/IChatMsgRepository';
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { IConnectionRepository } from '../../domain/repositories/IConnectionRepository';
import { VideoStatusUseCase } from './getVideoStatus';
import { LLMOrchestratorService } from '../services/LLMOrchestratorService';
import { GetChatHistoryResponseDTO, SendMessageRequestDTO, SendMessageResponseDTO } from '../dtos/chatMsgDTO'


export class ChatMessageUseCase {
    constructor(
        private chatMessageRepository: IChatMessageRepository,
        private chatRepository: IChatRepository,
        private connectionRepository: IConnectionRepository,
        private videoStatusUseCase: VideoStatusUseCase,
        private llmOrchestratorService: LLMOrchestratorService
    ) {}

    async sendMessage(dto: SendMessageRequestDTO): Promise<SendMessageResponseDTO> {
        const chat = await this.chatRepository.getChatByWhiteboardItemId(dto.chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        const userMessage = new ChatMessage(
            uuidv4(),
            chat.id,
            'user',
            dto.question,
            [],
            new Date()
        );
        await this.chatMessageRepository.save(userMessage);


        const connectionIds = await this.connectionRepository.findConnectionIdsForEntity(dto.chatId, 'ai');
        const contexts: string[] = [];
        const processedConnections: string[] = [];

        for (const connectedEntityId of connectionIds) {
            try {
                
                const job = await this.videoStatusUseCase.execute(connectedEntityId);
                
                
                if (job.status === 'done' && job.transcription) {
                    contexts.push(job.transcription);
                    processedConnections.push(connectedEntityId);
                }
            } catch (error) {
                console.error(`ChatMessageUseCase: Error processing connected entity ${connectedEntityId}:`, error);
            }
        }


        let answer: string;
        if (contexts.length > 0) {
            const combinedContext = contexts.join("\n--\n");
            answer = await this.llmOrchestratorService.generateResponse(dto.question, combinedContext);
        } else {
            
            if (connectionIds.length > 0) {
                answer = "I can see you have connected some resources to this chat, but their transcriptions are not ready yet. Please wait for the processing to complete, or check if the connected videos are accessible.";
            } else {
                answer = "I don't have any connected resources with transcriptions available yet. Please connect some videos or documents to this chat for me to provide context-aware responses.";
            }
        }

        const aiMessage = new ChatMessage(
            uuidv4(),
            chat.id,
            'assistant',
            answer,
            contexts,
            new Date()
        );

        await this.chatMessageRepository.save(aiMessage);


        return {
            answer,
            messageId: aiMessage.id,
            context: contexts,
        };
    }

    async getChatHistory(itemId: string): Promise<GetChatHistoryResponseDTO> {
        const chat = await this.chatRepository.getChatByWhiteboardItemId(itemId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        const messages = await this.chatMessageRepository.findByChatId(chat.id);
        
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

    async deleteMessage(messageId: string): Promise<void> {
        const message = await this.chatMessageRepository.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        await this.chatMessageRepository.deleteById(messageId);
    }

    async clearChatHistory(itemId: string): Promise<void> {
        const chat = await this.chatRepository.getChatByWhiteboardItemId(itemId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        await this.chatMessageRepository.deleteByChatId(chat.id);
    }

    async updateMessage(messageId: string, content: string): Promise<ChatMessage> {
        const message = await this.chatMessageRepository.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        message.content = content;
        message.updatedAt = new Date();

        return await this.chatMessageRepository.update(message);
    }
}