import { Router } from 'express';
import { WhiteboardItemController } from "../controllers/whiteboardItemController";

export function createWhiteboardItemRoutes(
    whiteboardItemController: WhiteboardItemController,
): Router {
        const router = Router();
    router.get("/whiteboard/:whiteboardId", whiteboardItemController.getItemsByWhiteboardId.bind(whiteboardItemController));
    router.get("/:id", whiteboardItemController.getItemById.bind(whiteboardItemController));
    router.post("/", whiteboardItemController.createItem.bind(whiteboardItemController));
    router.put("/:id", whiteboardItemController.updateItem.bind(whiteboardItemController));
    router.delete("/:id", whiteboardItemController.deleteItem.bind(whiteboardItemController));

    return router;
}

