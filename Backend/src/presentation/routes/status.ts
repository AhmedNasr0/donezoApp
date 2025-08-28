import { Router } from 'express'
import { StatusController } from '../controllers/statusController'
import { validateJobId } from '../middlewares/validations'

export function createStatusRoutes(statusController: StatusController): Router {
    const router = Router()

    router.get('/', statusController.getAllJobsStatus.bind(statusController))
    router.get('/:jobId', validateJobId, statusController.getJobStatus.bind(statusController))

    return router
}