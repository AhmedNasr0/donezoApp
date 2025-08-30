import { Router } from 'express'
import { StatusController } from '../controllers/statusController'
import { validateJobId } from '../middlewares/validations'

export function createStatusRoutes(statusController: StatusController): Router {
    const router = Router()

    router.get('/all-jobs/', statusController.getAllJobsStatus.bind(statusController))
    router.get('/job/:jobId', validateJobId, statusController.getJobStatus.bind(statusController))
    router.get('/video/:videoId', statusController.getVideoStatus.bind(statusController))
    return router
}