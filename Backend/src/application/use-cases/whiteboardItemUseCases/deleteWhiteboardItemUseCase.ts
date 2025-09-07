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
            // Step 1: Verify the item exists first
            const item = await this.whiteboardItemRepository.findById(itemId);
            if (!item) {
                console.log(`Whiteboard item with ID ${itemId} not found - may have been already deleted`);
                return; // Don't throw error for already deleted items
            }

            console.log(`Deleting whiteboard item ${itemId} with CASCADE DELETE for connections`);

            // Step 2: Delete the whiteboard item 
            // CASCADE DELETE will automatically handle all related connections
            await this.whiteboardItemRepository.deleteItem(itemId);
            
            console.log(`Successfully deleted whiteboard item ${itemId} and all its connections via CASCADE`);

        } catch (error: any) {
            // Handle specific PostgreSQL constraint violations
            if (error.code === '23503') {
                console.error(`Foreign key constraint violation when deleting item ${itemId}:`, error.message);
                throw new Error(`Cannot delete item ${itemId}: it has dependent connections that couldn't be removed automatically`);
            }
            
            console.error(`Error in DeleteWhiteboardItemUseCase for item ${itemId}:`, error);
            throw error;
        }
    }
}
