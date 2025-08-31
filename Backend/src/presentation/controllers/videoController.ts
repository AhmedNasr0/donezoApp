import { Request, Response, NextFunction } from 'express';
import { VideoUseCase } from '../../application/use-cases/videoUseCase';

export class VideoController {
    constructor(private videoUseCase: VideoUseCase) {}

    async deleteVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if(!id) return
            await this.videoUseCase.deleteVideo(id)

            res.json({
                success: true,
                message: 'video deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

}