import { Job } from "../../domain/entities/job.entity";
import { IJobRepository } from "../../domain/repositories/IJobRepository";
import { IVideoRepository } from "../../domain/repositories/IVideoRepository";


export class VideoStatusUseCase{
    constructor(
        private readonly videoRepository: IVideoRepository,
        private readonly jobRepository: IJobRepository,
    ) {}

    async execute(videoId: string): Promise<Job> {
        const getVideo = await this.videoRepository.findById(videoId);
        if (!getVideo) {
            throw new Error('Video not found');
        }
        const jobId = getVideo.jobId;
        if(!jobId)
            throw new Error('Job id not found');
        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        return job;
    }

}