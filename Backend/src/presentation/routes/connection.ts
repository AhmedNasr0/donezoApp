import { Router } from 'express';
import { ConnectionController } from '../controllers/connectionController';
import { validateConnectionRequest, validateUpdateConnectionRequest } from '../middlewares/validations';

export function createConnectionRoutes(connectionController: ConnectionController): Router {
    const router = Router();

    router.post('/', validateConnectionRequest, connectionController.createConnection.bind(connectionController));
    router.get('/', connectionController.getAllConnections.bind(connectionController));
    router.get('/entity', connectionController.getConnectionsForEntity.bind(connectionController));
    router.get('/:id', connectionController.getConnectionById.bind(connectionController));
    router.put('/:id', validateUpdateConnectionRequest, connectionController.updateConnection.bind(connectionController));
    router.delete('/:id', connectionController.deleteConnection.bind(connectionController));
    router.post('/disconnect', connectionController.disconnectEntities.bind(connectionController));

    return router;
}
