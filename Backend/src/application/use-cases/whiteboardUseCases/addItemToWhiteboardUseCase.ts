import { WhiteboardItem } from "../../../domain/entities/whiteboardItem.entity";
import { IWhiteboardRepository } from "../../../domain/repositories/IWhiteboardRepository";


export class AddItemToWhiteboardUseCase{
    constructor(private whiteboardRepository: IWhiteboardRepository) {}

    async execute(whiteboardId: string, whiteboardItem: WhiteboardItem): Promise<void> {
        const whiteboard = await this.whiteboardRepository.getById(whiteboardId);
        whiteboard.addItem(whiteboardItem);
        await this.whiteboardRepository.updateWhiteboard(whiteboard);
    }

}