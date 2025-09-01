import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { validateChatRequest, validateUpdateChatRequest } from '../middlewares/validations';

export function createChatRoutes(chatController: ChatController): Router {
    const router = Router();

    router.post('/', validateChatRequest, chatController.createChat.bind(chatController));
    router.get('/', chatController.getAllChats.bind(chatController));
    router.get('/:id', chatController.getChatById.bind(chatController));
    router.put('/:id', validateUpdateChatRequest, chatController.updateChat.bind(chatController));
    router.delete('/:id', chatController.deleteChat.bind(chatController));
    router.post('/send-message/:chatId', chatController.sendMessage.bind(chatController));

    return router;
}