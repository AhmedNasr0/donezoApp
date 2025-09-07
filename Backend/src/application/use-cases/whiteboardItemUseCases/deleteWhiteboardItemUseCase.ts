import { IWhiteboardItemRepository } from "../../../domain/repositories/IWhiteboardItemRepository";
import { IConnectionRepository } from "../../../domain/repositories/IConnectionRepository";
import { WhiteboardItem } from "../../../domain/entities/whiteboardItem.entity";

export class DeleteWhiteboardItemUseCase {
    constructor(
        private whiteboardItemRepository: IWhiteboardItemRepository,
        private connectionRepository: IConnectionRepository
    ) {}

    async execute(itemId: string): Promise<void> {
        try {

            const item = await this.whiteboardItemRepository.findById(itemId);
            if (!item) {
                (`Whiteboard item with ID ${itemId} not found - may have been already deleted`);
                return;
            }


            await this.whiteboardItemRepository.deleteItem(itemId);
            

        } catch (error: any) {
            if (error.code === '23503') {
                console.error(`Foreign key constraint violation when deleting item ${itemId}:`, error.message);
                throw new Error(`Cannot delete item ${itemId}: it has dependent connections that couldn't be removed automatically`);
            }
            
            console.error(`Error in DeleteWhiteboardItemUseCase for item ${itemId}:`, error);
            throw error;
        }
    }
}
