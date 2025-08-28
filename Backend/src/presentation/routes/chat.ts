import { Router } from 'express'
import { ChatController } from '../controllers/chatController'
import { validateChatRequest } from '../middlewares/validations'

export function createChatRoutes(chatController: ChatController): Router {
    const router = Router()

    router.post('/', validateChatRequest, chatController.chat.bind(chatController))

    return router
}