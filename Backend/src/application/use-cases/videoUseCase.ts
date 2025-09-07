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

        const relatedConnections:any = await this.connectionRepository.findConnectionsByID(id);
        if(relatedConnections === null) return;
        for (const connectionId of relatedConnections) {
            await this.connectionRepository.deleteConnection(connectionId.id);
        }

        const jobs = await this.jobRepository.findAll();
        for (const job of jobs) {
            if(job.resourceId === id)
            await this.jobRepository.delete(job.id);
        }


        return await this.videoRepository.delete(id);
    }

}
