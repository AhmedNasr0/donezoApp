import { IWhiteboardRepository } from "../../../domain/repositories/IWhiteboardRepository";
import { Whiteboard } from "../../../domain/entities/whiteboard.entity"

export class GetUserWhiteboardUseCase{
    constructor(private whiteboardRepo: IWhiteboardRepository) {}

    async excute(userId:string) : Promise<Whiteboard>{
        const whiteboard = await this.whiteboardRepo.getUserWhiteboard(userId);
        if(!whiteboard) throw new Error('Whiteboard not found');
        return whiteboard;
    }
            
}