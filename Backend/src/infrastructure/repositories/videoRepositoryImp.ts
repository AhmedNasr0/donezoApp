import { IVideoRepository } from '../../domain/repositories/IVideoRepository'
import { Video } from '../../domain/entities/video.entity'
import { DatabaseConnection } from '../database/connection'

export class VideoRepository implements IVideoRepository {
    private db: DatabaseConnection

    constructor() {
        this.db = DatabaseConnection.getInstance()
    }

    async save(video: Video): Promise<void> {
        const query = `
            INSERT INTO videos (id, url, platform, title, created_at, job_id)
            VALUES ($1, $2, $3, $4, $5, $6)
        `
        const values = [
            video.id,
            video.url,
            video.platform,
            video.title,
            video.createdAt,
            video.jobId || null
        ]
        
        await this.db.query(query, values)
    }

    async findById(id: string): Promise<Video | null> {
        const query = 'SELECT * FROM videos WHERE id = $1'
        const result = await this.db.query(query, [id])
        
        if (result.rows.length === 0) {
            return null
        }

        const row = result.rows[0]
        return new Video(
            row.id,
            row.url,
            row.platform,
            row.title,
            new Date(row.created_at),
            row.job_id
        )
    }

    async findAll(): Promise<Video[]> {
        const query = 'SELECT * FROM videos ORDER BY created_at DESC'
        const result = await this.db.query(query)
        
        return result.rows.map((row: any) => new Video(
            row.id,
            row.url,
            row.platform,
            row.title,
            new Date(row.created_at),
            row.job_id
        ))
    }

    async findByJobId(jobId: string): Promise<Video | null> {
        const query = 'SELECT * FROM videos WHERE job_id = $1'
        const result = await this.db.query(query, [jobId])
        
        if (result.rows.length === 0) {
            return null
        }

        const row = result.rows[0]
        return new Video(
            row.id,
            row.url,
            row.platform,
            row.title,
            new Date(row.created_at),
            row.job_id
        )
    }
}