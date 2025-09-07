import { v4 as uuidv4 } from 'uuid'
import { Job } from '../../domain/entities/job.entity'
import { IJobRepository } from '../../domain/repositories/IJobRepository'
import { IMessageQueueService } from '../../domain/services/IMessageQueueService'
import { IWhiteboardItemRepository } from '../../domain/repositories/IWhiteboardItemRepository'
import { WhiteboardItem } from '../../domain/entities/whiteboardItem.entity'
export class UploadVideoUseCase {
    constructor(
        private jobRepository: IJobRepository,
        private messageQueueService: IMessageQueueService
    ) {}

    async execute(item: WhiteboardItem): Promise<{ jobId: string; videoId: string }> {
        const jobId = uuidv4()

        const job = new Job(jobId, 'processing', new Date(), item.id)
        

        await this.jobRepository.save(job)

        const videoId = item.id

        

        await this.messageQueueService.sendToQueue('video_processing', {
            jobId,
            videoId,
            videoUrl: item.content,
            platform: item.type
        })

        job.markAsProcessing()
        await this.jobRepository.update(job)

        return { jobId, videoId }
    }
}