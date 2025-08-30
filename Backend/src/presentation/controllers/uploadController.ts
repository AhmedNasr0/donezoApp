import { Request, Response, NextFunction } from 'express'
import { UploadVideoUseCase } from '../../application/use-cases/uploadVideoUseCase'
import { UploadVideoDTO } from '../../application/dtos/uploadVideoDTO'
import { ValidationError } from '../../shared/errors/validationError'
import { UploaVideoResponse } from '../../shared/types/uploadVideo'

export class UploadController {
    constructor(private uploadVideoUseCase: UploadVideoUseCase) {}

    async uploadVideo(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { url, platform, title } = req.body as UploadVideoDTO

            if (!url || !platform) {
                throw new ValidationError('URL and platform are required')
            }

            if (!['youtube', 'tiktok', 'instagram'].includes(platform)) {
                throw new ValidationError('Platform must be one of: youtube, tiktok, instagram')
            }


            const result = await this.uploadVideoUseCase.execute({
                url,
                platform,
                title
            })

            res.status(201).json({
                success: true,
                message: 'Video upload initiated successfully',
                data: {
                    jobId: result.jobId,
                    videoId: result.videoId,
                    status: 'pending'
                }
            })
        } catch (error) {
            next(error)
        }
    }
}