import { Router } from 'express'
import { UploadController } from '../controllers/uploadController'
import { validateUploadRequest } from '../middlewares/validations'

export function createUploadRoutes(uploadController: UploadController): Router {
    const router = Router()

    router.post('/', validateUploadRequest, uploadController.uploadVideo.bind(uploadController))

    return router
}