import { Request, Response, NextFunction } from 'express';
import { ChatUseCase } from '../../application/use-cases/chatUseCase';
import { CreateChatRequestDTO, UpdateChatRequestDTO } from '../../application/dtos/ChatDTO';
import { ValidationError } from '../../shared/errors/validationError';

export class ChatController {
    constructor(private chatUseCase: ChatUseCase) {}

    async createChat(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const dto: CreateChatRequestDTO = req.body;

            if (!dto.chat_name || dto.chat_name.trim().length === 0) {
                throw new ValidationError('Chat name is required');
            }

            const chat = await this.chatUseCase.createChat(dto);

            res.status(201).json({
                success: true,
                data: chat,
                message: 'Chat created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getChatById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if(!id) return
            const chat = await this.chatUseCase.getChatById(id);

            if (!chat) {
                res.status(404).json({
                    success: false,
                    message: 'Chat not found'
                });
                return;
            }

            res.json({
                success: true,
                data: chat
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllChats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chats = await this.chatUseCase.getAllChats();

            res.json({
                success: true,
                data: chats,
                count: chats.length
            });
        } catch (error) {
            next(error);
        }
    }

    async updateChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const dto: UpdateChatRequestDTO = { ...req.body, id };

            const chat = await this.chatUseCase.updateChat(dto);

            res.json({
                success: true,
                data: chat,
                message: 'Chat updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if(!id) return
            await this.chatUseCase.deleteChat(id);

            res.json({
                success: true,
                message: 'Chat deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {chatId} = req.params
            const {question } = req.body;
            if (!question) {
                throw new ValidationError('Question is required');
            }
            if(!chatId) return
            const chat = await this.chatUseCase.sendMessage(chatId, question);
            var message = 'message sent Successfully'
            if(!chat.answer) message = 'no transcript available'

            res.json({
                success: true,
                data: chat,
                message
            });
        } catch (error) {
            next(error);
        }
    }
}