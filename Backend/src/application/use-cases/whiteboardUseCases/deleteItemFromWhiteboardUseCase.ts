import { IWhiteboardRepository } from "../../../domain/repositories/IWhiteboardRepository";



export class DeleteItemFromWhiteboardUseCase{
    constructor(private whiteboardRepository: IWhiteboardRepository) {}

    async execute(whiteboardId: string, itemId: string){
        const whiteboard = await this.whiteboardRepository.getById(whiteboardId);
        if(!whiteboard){
            throw new Error("Whiteboard not found");
        }
        whiteboard.removeItem(itemId)
        await this.whiteboardRepository.updateWhiteboard(whiteboard);
    }
}