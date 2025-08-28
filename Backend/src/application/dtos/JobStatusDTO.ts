

export interface JobStatusDTO {
    id: string
    status: string
    createdAt: Date
    videoId?: string
    transcription?: string
    error?: string
}