

export interface UploadVideoDTO {
    url: string
    platform: 'youtube' | 'tiktok' | 'instagram'
    title?: string
}