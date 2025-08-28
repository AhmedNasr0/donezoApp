import { Video } from "../entities/video.entity";

export interface IVideoRepository{
    save(video:Video):Promise<void>,
    findById(id:string):Promise<Video|null>,
    findAll():Promise<Video[]>,
}