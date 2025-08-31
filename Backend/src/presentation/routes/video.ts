import { Router } from 'express';
import { VideoController } from '../controllers/videoController';
export function createVideoRoutes(videoController: VideoController): Router {
    const router = Router();

    router.delete('/:id', videoController.deleteVideo.bind(videoController));

    return router;
}
