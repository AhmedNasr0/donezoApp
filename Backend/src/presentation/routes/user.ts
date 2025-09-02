import { Router } from 'express';
import { UserController } from '../controllers/userController';
export function createUserRoutes(userController: UserController): Router {

    const router = Router();

    router.post("/", UserController.createUser);
    router.get("/", UserController.getUserByEmail);
    
    return router;
}