import { IWhiteboardRepository } from "../../../domain/repositories/IWhiteboardRepository";
import { Whiteboard } from "../../../domain/entities/whiteboard.entity"

export class GetWhiteboardByIDUseCase{
    constructor(private whiteboardRepo: IWhiteboardRepository) {}

    async excute(whiteboardId:string) : Promise<Whiteboard>{
        const whiteboard = await this.whiteboardRepo.getById(whiteboardId);
        if(!whiteboard) throw new Error('Whiteboard not found');
        return whiteboard;
    }
            
}