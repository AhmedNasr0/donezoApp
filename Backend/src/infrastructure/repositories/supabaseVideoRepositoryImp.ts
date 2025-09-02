import { IVideoRepository } from '../../domain/repositories/IVideoRepository'
import { Video } from '../../domain/entities/video.entity'
import { supabase } from '../database/supabase_client'  

export class VideoRepository implements IVideoRepository {
    async save(video: Video): Promise<void> {
        const { error } = await supabase
            .from('videos')
            .insert({
                id: video.id,
                url: video.url,
                platform: video.platform,
                title: video.title,
                created_at: video.createdAt,
                job_id: video.jobId || null
            })

        if (error) throw error
    }

    async findById(id: string): Promise<Video | null> {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // no rows found
            throw error
        }

        return new Video(
            data.id,
            data.url,
            data.platform,
            data.title,
            new Date(data.created_at),
            data.job_id
        )
    }

    async findAll(): Promise<Video[]> {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((row: any) => new Video(
            row.id,
            row.url,
            row.platform,
            row.title,
            new Date(row.created_at),
            row.job_id
        ))
    }

    async findByJobId(jobId: string): Promise<Video | null> {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('job_id', jobId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }

        return new Video(
            data.id,
            data.url,
            data.platform,
            data.title,
            new Date(data.created_at),
            data.job_id
        )
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
