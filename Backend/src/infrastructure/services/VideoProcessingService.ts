import { Video } from '../../domain/entities/video.entity'
import { IVideoProcessingService } from '../../domain/services/IVideoProcessingService'

export class VideoProcessingService implements IVideoProcessingService {
    async processVideo(video:Video): Promise<void> {
        // This will be handled by the worker service
        throw new Error('Video processing should be handled by worker service')
    }
}
