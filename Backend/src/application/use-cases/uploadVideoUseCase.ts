import { v4 as uuidv4 } from 'uuid'
import { Job } from '../../domain/entities/job.entity'
import { Video } from '../../domain/entities/video.entity'
import { IJobRepository } from '../../domain/repositories/IJobRepository'
import { IVideoRepository } from '../../domain/repositories/IVideoRepository'
import { IMessageQueueService } from '../../domain/services/IMessageQueueService'
import { UploadVideoDTO } from '../dtos/uploadVideoDTO'

export class UploadVideoUseCase {
    constructor(
        private jobRepository: IJobRepository,
        private videoRepository: IVideoRepository,
        private messageQueueService: IMessageQueueService
    ) {}

    async execute(uploadVideoDTO: UploadVideoDTO): Promise<{ jobId: string; videoId: string }> {
        const jobId = uuidv4()
        const videoId = uuidv4()

        const job = new Job(jobId, 'pending', new Date(), videoId)
        
        const video = new Video(
            videoId,
            uploadVideoDTO.url,
            uploadVideoDTO.platform,
            uploadVideoDTO.title || 'Untitled Video',
            new Date(),
            jobId
        )

        await this.jobRepository.save(job)
        await this.videoRepository.save(video)

        // send to message queue for processing
        await this.messageQueueService.sendToQueue('video_processing', {
            jobId,
            videoId,
            videoUrl: uploadVideoDTO.url,
            platform: uploadVideoDTO.platform
        })

        job.markAsProcessing()
        await this.jobRepository.update(job)

        return { jobId, videoId }
    }
}