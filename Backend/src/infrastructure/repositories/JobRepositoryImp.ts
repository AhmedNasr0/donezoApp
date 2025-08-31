import { IJobRepository } from '../../domain/repositories/IJobRepository'
import { Job } from '../../domain/entities/job.entity'
import { DatabaseConnection } from '../database/connection'

export class JobRepository implements IJobRepository {
    private db: DatabaseConnection

    constructor() {
        this.db = DatabaseConnection.getInstance()
    }

    async save(job: Job): Promise<void> {
        const query = `
            INSERT INTO jobs (id, status, created_at, transcription,resourceId, error)
            VALUES ($1, $2, $3, $4, $5 ,$6)
        `
        const values = [
            job.id,
            job.status,
            job.createdAt,
            job.transcription || null,
            job.resourceId,
            job.error || null
        ]
        
        await this.db.query(query, values)
    }

    async findById(id: string): Promise<Job | null> {
        const query = 'SELECT * FROM jobs WHERE id = $1'
        const result = await this.db.query(query, [id])
        
        if (result.rows.length === 0) {
            return null
        }

        const row = result.rows[0]
        return new Job(
            row.id,
            row.status,
            new Date(row.created_at),
            row.video_id,
            row.transcription,
            row.error
        )
    }

    async findAll(): Promise<Job[]> {
        const query = 'SELECT * FROM jobs ORDER BY created_at DESC'
        const result = await this.db.query(query)
        
        return result.rows.map((row: any) => new Job(
            row.id,
            row.status,
            new Date(row.created_at),
            row.video_id,
            row.transcription,
            row.error
        ))
    }

    async update(job: Job): Promise<void> {
        const query = `
            UPDATE jobs 
            SET status = $1, transcription = $2, error = $3, updated_at = NOW()
            WHERE id = $4
        `
        const values = [job.status, job.transcription || null, job.error || null, job.id]
        
        await this.db.query(query, values)
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM jobs WHERE id = $1'
        await this.db.query(query, [id])
    }
}

export const jobRepository = new JobRepository()