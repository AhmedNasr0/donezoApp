import { Connection } from "../../domain/entities/connection.entity";
import { IConnectionRepository } from "../../domain/repositories/IConnectionRepository";
import { IJobRepository } from "../../domain/repositories/IJobRepository";
import { IVideoRepository } from "../../domain/repositories/IVideoRepository";

export class VideoUseCase {
    constructor(
        private videoRepository: IVideoRepository,
        private connectionRepository: IConnectionRepository,
        private jobRepository: IJobRepository
    ) {

    }

    
    async deleteVideo(id: string): Promise<void> {

        // delete all connections relate to the video
        const relatedConnections:Connection[]|null = await this.connectionRepository.findConnectionsByID(id);
        if(relatedConnections === null) return;
        for (const connectionId of relatedConnections) {
            await this.connectionRepository.deleteConnection(connectionId.id);
        }

        // delete all jobs connected to this video 
        const jobs = await this.jobRepository.findAll();
        for (const job of jobs) {
            if(job.resourceId === id)
            await this.jobRepository.delete(job.id);
        }


        return await this.videoRepository.delete(id);
    }

}
