import { Router } from 'express';
import { ConnectionController } from '../controllers/connectionController';

export function createConnectionRoutes(connectionController: ConnectionController): Router {
    const router = Router();

    // Connection routes
    router.post('/', connectionController.createConnection.bind(connectionController));
    router.delete('/:id', connectionController.deleteConnection.bind(connectionController));
    router.get('/item/:itemId', connectionController.getConnectionsForItem.bind(connectionController));
    router.put('/:id', connectionController.updateConnection.bind(connectionController));

    return router;
}
