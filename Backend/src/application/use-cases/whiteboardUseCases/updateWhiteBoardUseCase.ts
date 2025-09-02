import { IWhiteboardRepository } from "../../../domain/repositories/IWhiteboardRepository";
import { Whiteboard } from "../../../domain/entities/whiteboard.entity"

export class UpdateWhiteboardUseCase {
    constructor(private whiteboardRepo: IWhiteboardRepository) {}

    async excute(whiteboard:Whiteboard) : Promise<Whiteboard>{
        
        const updatedWhiteboard = await this.whiteboardRepo.updateWhiteboard(whiteboard);

        if(!updatedWhiteboard) throw new Error('Whiteboard not found');
        return updatedWhiteboard;
    }
            
}