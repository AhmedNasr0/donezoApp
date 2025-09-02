import { Job } from "../../domain/entities/job.entity";
import { IJobRepository } from "../../domain/repositories/IJobRepository";
import { IWhiteboardItemRepository } from "../../domain/repositories/IWhiteboardItemRepository";

export class VideoStatusUseCase {
    constructor(
        private readonly whiteboardItemRepository: IWhiteboardItemRepository,
        private readonly jobRepository: IJobRepository,
    ) {}

    async execute(videoId: string): Promise<Job> {

        // First try to find the whiteboard item
        const getItem = await this.whiteboardItemRepository.findById(videoId);
        if (!getItem) {
            console.error(`VideoStatusUseCase: Whiteboard item not found for ID: ${videoId}`);
            throw new Error(`Video not found with ID: ${videoId}`);
        }


        // Get all jobs and find the one that matches this resource
        const allJobs = await this.jobRepository.findAll();

        // Look for job that matches the whiteboard item ID
        const job = allJobs.find((job) => {
            return job.resourceId === getItem.id;
        });
        
        if (!job) {
            console.error(`VideoStatusUseCase: No job found for resourceId: ${getItem.id}`);
            throw new Error(`Job not found for video ID: ${videoId}`);
        }

        
        return job;    
    }
}