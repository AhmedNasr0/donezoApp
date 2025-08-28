import { Request, Response } from 'express'
import { GetJobStatusUseCase } from '../../application/use-cases/GetJobStatus'
import { AppError } from '../../shared/errors/AppError'

export class StatusController {
  constructor(private getJobStatusUseCase: GetJobStatusUseCase) {}

  // GET /status
  async getAllJobsStatus(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await this.getJobStatusUseCase.getAllStatuses()
      res.json(jobs)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // GET /status/:jobId
  async getJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params
      if (!jobId) {
        throw new AppError('Job ID is required', 400)
      }
      const job = await this.getJobStatusUseCase.execute(jobId)
      res.json(job)
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message })
      } else {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  }
}
