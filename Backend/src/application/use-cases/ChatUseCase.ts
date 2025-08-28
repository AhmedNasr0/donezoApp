import { v4 as uuidv4 } from 'uuid'
import { ChatMessage } from '../../domain/entities/chat.entity'
import { IChatRepository } from '../../domain/repositories/IChatRepository'
import { IJobRepository } from '../../domain/repositories/IJobRepository'
import { IChatService } from '../../domain/services/IChatService'
import { ChatRequestDTO } from '../dtos/chatRequestDTO'
import { AppError } from '../../shared/errors/AppError'

export class ChatUseCase {
    constructor(
        private chatRepository: IChatRepository,
        private jobRepository: IJobRepository,
        private chatService: IChatService
    ) {}

    async execute(chatRequestDTO: ChatRequestDTO): Promise<{ answer: string; context: string[] }> {
    
        const allJobs = await this.jobRepository.findAll()
        const completedJobs = allJobs.filter(job => job.status === 'done' && job.transcription)

        if (completedJobs.length === 0) {
            throw new AppError('No transcriptions available. Please upload and process videos first.', 400)
        }

        const context = completedJobs.map(job => job.transcription!).filter(Boolean)
        const contextString = context.join('\n\n---\n\n')

        const answer = await this.chatService.generateResponse(chatRequestDTO.question, contextString)

        // Save chat message
        const chatMessage = new ChatMessage(
            uuidv4(),
            chatRequestDTO.question,
            answer,
            context,
            new Date()
        )

        await this.chatRepository.save(chatMessage)

        return { answer, context }
    }
}