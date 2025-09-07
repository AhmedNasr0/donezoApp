import { Request, Response } from "express";
import { WhiteboardItemRepository } from "../../infrastructure/repositories/supabaseWhiteboardItemRepository";
import { WhiteboardItem } from "../../domain/entities/whiteboardItem.entity";
import { UploadVideoUseCase } from "../../application/use-cases/uploadVideoUseCase";
import { DeleteWhiteboardItemUseCase } from "../../application/use-cases/whiteboardItemUseCases/deleteWhiteboardItemUseCase";

export class WhiteboardItemController {

    constructor(
        private repository: WhiteboardItemRepository,
        private uploadVideoUseCase: UploadVideoUseCase,
        private deleteWhiteboardItemUseCase: DeleteWhiteboardItemUseCase
    ) {

    }

    async getItemsByWhiteboardId(req: Request, res: Response) {
        try {
            const { whiteboardId } = req.params;
            if(!whiteboardId) return res.json({message: "whiteboardId is required"});

            const items = await this.repository.findItemsByWhiteboardId(whiteboardId);
            res.json(items);
        } catch (error: any) {
            console.error("Error fetching whiteboard items:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async getItemById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if(!id) return res.json({message: "id is required"});

            const item = await this.repository.findById(id);
            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }
            res.json(item);
        } catch (error: any) {
            console.error("Error fetching item:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async createItem(req: Request, res: Response) {
        try {
            const { item , userEmail } = req.body;
            const newItem = new WhiteboardItem(
                item.id,
                item.type,
                item.title,
                item.content,
                item.position,
                item.size,
                item.zIndex,
                item.isAttached,
                item.isLocked,
                new Date(),
                new Date(),
                item.connections,
                item.whiteboardId
            );

            if(newItem.type == 'youtube'||newItem.type == 'tiktok'||newItem.type == 'instagram' ){
                await this.uploadVideoUseCase.execute(newItem)
            }

            const savedItem = await this.repository.createItem(newItem);
            res.status(201).json({
                success: true,
                data: savedItem
            });
        } catch (error: any) {
            console.error("Error creating item:", error);
            res.status(500).json({ error: error.message });
        }
    }


    async updateItem(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if(!id) return res.json({message: "id is required"});


            const existing = await this.repository.findById(id);
            if (!existing) {
                return res.status(404).json({ message: "Item not found" });
            }

            // Extract item data from the request body
            const itemData = req.body.item || req.body;
            
            const updated = new WhiteboardItem(
                id,
                itemData.type ?? existing.type,
                itemData.title ?? existing.title,
                itemData.content ?? existing.content,
                itemData.position ?? existing.position,
                itemData.size ?? existing.size,
                itemData.zIndex ?? existing.zIndex,
                itemData.isAttached ?? existing.isAttached,
                itemData.isLocked ?? existing.isLocked,
                existing.createdAt,
                new Date(),
                itemData.connections ?? existing.connections,
                itemData.whiteboardId ?? existing.whiteboardId
            );

            const result = await this.repository.updateItem(updated);
            res.json(result);
        } catch (error: any) {
            console.error("Error updating item:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async deleteItem(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            if(!id) {
                return res.json({message: "id is required"});
            }

            // Use the DeleteWhiteboardItemUseCase to handle cascade deletion
            await this.deleteWhiteboardItemUseCase.execute(id);
            
            res.status(204).send();
        } catch (error: any) {
            console.error("Error deleting item:", error);
            console.error("Item ID that failed to delete:", req.params.id);
            res.status(500).json({ error: error.message });
        }
    }
}
