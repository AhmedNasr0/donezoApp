import { Router } from 'express';
import { WhiteboardController } from '../controllers/whiteboardController';
import { ConnectionController } from '../controllers/connectionController';

export function createWhiteboardRoutes(
    whiteboardController: WhiteboardController,
): Router {
    const router = Router();

    // Whiteboard routes
    router.get('/user/:email', whiteboardController.getUserWhiteboard.bind(whiteboardController));
    router.get('/:id', whiteboardController.getWhiteboardByID.bind(whiteboardController));
    router.post('/', whiteboardController.createWhiteboard.bind(whiteboardController));
    router.put('/:id', whiteboardController.updateWhiteboard.bind(whiteboardController));
    router.post('/:id/save-state', whiteboardController.saveWhiteboardState.bind(whiteboardController));

    return router;
}

