import { Router } from 'express'
import { ChatMsgController } from '../controllers/chatMsgController'
import { validateChatRequest } from '../middlewares/validations'

export function createChatMsgRoutes(chatController: ChatMsgController): Router {
    const router = Router()

    router.post('/', validateChatRequest, chatController.chat.bind(chatController))

    return router
}