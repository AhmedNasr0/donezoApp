import { IJobRepository } from '../../domain/repositories/IJobRepository'
import { JobStatusDTO } from '../dtos/JobStatusDTO'
import { AppError } from '../../shared/errors/AppError'

export class GetJobStatusUseCase {
    constructor(private jobRepository: IJobRepository) {}

    async execute(jobId: string): Promise<JobStatusDTO> {
        const job = await this.jobRepository.findById(jobId)
        
        if (!job) {
            throw new AppError('Job not found', 404)
        }

        return {
            id: job.id,
            status: job.status,
            createdAt: job.createdAt,
            transcription: job.transcription,
            error: job.error
        }
    }

    async getAllStatuses(): Promise<JobStatusDTO[]> {
        const jobs = await this.jobRepository.findAll()
        
        return jobs.map(job => ({
            id: job.id,
            status: job.status,
            createdAt: job.createdAt,
            transcription: job.transcription,
            error: job.error
        }))
    }
}