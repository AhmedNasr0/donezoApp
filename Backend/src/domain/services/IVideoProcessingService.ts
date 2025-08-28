import { Video } from "../entities/video.entity";


export interface IVideoProcessingService {
    processVideo(video:Video): Promise<void>;
}