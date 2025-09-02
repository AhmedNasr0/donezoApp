import { Request, Response } from 'express';
import { ChatUseCase } from '../../application/use-cases/ChatUseCase';
import { ChatMessageUseCase } from '../../application/use-cases/ChatMsgUseCase';

export class ChatController {
    constructor(
        private chatUseCase: ChatUseCase,
        private chatMessageUseCase: ChatMessageUseCase
    ) {}

    async createChat(req: Request, res: Response): Promise<void> {
        try {
            const { chat_name, whiteboardId, numOfConnections } = req.body;
            const chat = await this.chatUseCase.createChat({
                chat_name,
                whiteboardId,
                numOfConnections
            });

            res.status(201).json({
                success: true,
                data: chat
            });
        } catch (error) {
            console.error('Error creating chat:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create chat'
            });
        }
    }

    // Get chat by ID with messages
    async getChatById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if(!id) return ;
            const chat = await this.chatUseCase.getChatById(id);

            if (!chat) {
                res.status(404).json({
                    success: false,
                    error: 'Chat not found'
                });
                return;
            }

            res.json({
                success: true,
                data: chat
            });
        } catch (error) {
            console.error('Error getting chat:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get chat'
            });
        }
    }

    // Get all chats
    async getAllChats(req: Request, res: Response): Promise<void> {
        try {
            const chats = await this.chatUseCase.getAllChats();

            res.json({
                success: true,
                data: chats
            });
        } catch (error) {
            console.error('Error getting chats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get chats'
            });
        }
    }

    // Update chat
    async updateChat(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const chat = await this.chatUseCase.updateChat({
                id,
                ...updateData
            });

            res.json({
                success: true,
                data: chat
            });
        } catch (error) {
            console.error('Error updating chat:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update chat'
            });
        }
    }

    // Delete chat
    async deleteChat(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if(!id) return;
            await this.chatUseCase.deleteChat(id);

            res.json({
                success: true,
                message: 'Chat deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting chat:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete chat'
            });
        }
    }

    // Send message to chat
    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { chatId } = req.params;
            const { question } = req.body;

            if (!question || !question.trim()) {
                res.status(400).json({
                    success: false,
                    error: 'Question is required'
                });
                return;
            }
            if(!chatId) return ;
            const result = await this.chatMessageUseCase.sendMessage({
                chatId,
                question: question.trim()
            });

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to send message'
            });
        }
    }

    // Get chat history
    async getChatHistory(req: Request, res: Response): Promise<void> {
        try {
            const { chatId } = req.params;
            if(!chatId) return ;
            const history = await this.chatMessageUseCase.getChatHistory(chatId);

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            console.error('Error getting chat history:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get chat history'
            });
        }
    }

    // Clear chat history
    async clearChatHistory(req: Request, res: Response): Promise<void> {
        try {
            const { chatId } = req.params;
            if(!chatId) return ;
            await this.chatMessageUseCase.clearChatHistory(chatId);

            res.json({
                success: true,
                message: 'Chat history cleared successfully'
            });
        } catch (error) {
            console.error('Error clearing chat history:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to clear chat history'
            });
        }
    }

    // Delete specific message
    async deleteMessage(req: Request, res: Response): Promise<void> {
        try {
            const { messageId } = req.params;
            if(!messageId) return ;
            await this.chatMessageUseCase.deleteMessage(messageId);

            res.json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete message'
            });
        }
    }

    // Update message
    async updateMessage(req: Request, res: Response): Promise<void> {
        try {
            const { messageId } = req.params;
            const { content } = req.body;

            if (!content || !content.trim()) {
                res.status(400).json({
                    success: false,
                    error: 'Content is required'
                });
                return;
            }
            if(!messageId) return ;
            
            const message = await this.chatMessageUseCase.updateMessage(messageId, content.trim());

            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Error updating message:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update message'
            });
        }
    }
}