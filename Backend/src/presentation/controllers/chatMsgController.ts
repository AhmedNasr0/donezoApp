    import { Request, Response, NextFunction } from 'express'
    import { ChatMsgUseCase } from '../../application/use-cases/ChatMsgUseCase'
    import { ChatRequestDTO } from '../../application/dtos/chatRequestDTO'
    import { ValidationError } from '../../shared/errors/validationError'

    export class ChatMsgController {
        constructor(private chatUseCase: ChatMsgUseCase) {}

        async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const { question } = req.body as ChatRequestDTO

                if (!question || question.trim().length === 0) {
                    throw new ValidationError('Question is required')
                }

                const result = await this.chatUseCase.execute({ question })

                res.json({
                    success: true,
                    data: {
                        question,
                        answer: result.answer,
                        contextSources: result.context.length,
                        timestamp: new Date().toISOString()
                    }
                })
            } catch (error) {
                next(error)
            }
        }
    }
