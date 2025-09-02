import { Router } from 'express';
import { ChatController } from '../../presentation/controllers/chatController';

export function createChatRoutes(chatController: ChatController): Router {
    const router = Router();

    router.post('/', chatController.createChat.bind(chatController));
    router.get('/', chatController.getAllChats.bind(chatController));
    router.get('/:id', chatController.getChatById.bind(chatController));
    router.put('/:id', chatController.updateChat.bind(chatController));
    router.delete('/:id', chatController.deleteChat.bind(chatController));

    router.post('/send-message/:chatId', chatController.sendMessage.bind(chatController));
    router.get('/:chatId/history', chatController.getChatHistory.bind(chatController));
    router.delete('/:chatId/history', chatController.clearChatHistory.bind(chatController));
    
    router.delete('/messages/:messageId', chatController.deleteMessage.bind(chatController));
    router.put('/messages/:messageId', chatController.updateMessage.bind(chatController));

    return router;
}