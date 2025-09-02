import { IJobRepository } from '../../domain/repositories/IJobRepository'
import { Job } from '../../domain/entities/job.entity'
import { supabase } from '../database/supabase_client' 

export class JobRepository implements IJobRepository {
    async save(job: Job): Promise<void> {
        const { error } = await supabase
            .from('jobs')
            .insert({
                id: job.id,
                status: job.status,
                created_at: job.createdAt,
                transcription: job.transcription || null,
                resourceid: job.resourceId,
                error: job.error || null
            })

        if (error) throw error
    }

    async findById(id: string): Promise<Job | null> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // no rows
            throw error
        }

        return new Job(
            data.id,
            data.status,
            new Date(data.created_at),
            data.resourceId,
            data.transcription,
            data.error
        )
    }

    async findAll(): Promise<Job[]> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((row: any) => new Job(
            row.id,
            row.status,
            new Date(row.created_at),
            row.resourceid,
            row.transcription,
            row.error
        ))
    }

    async update(job: Job): Promise<void> {
        const { error } = await supabase
            .from('jobs')
            .update({
                status: job.status,
                transcription: job.transcription || null,
                error: job.error || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', job.id)

        if (error) throw error
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

export const jobRepository = new JobRepository()
