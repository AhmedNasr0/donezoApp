
type videoPlatforms = 'youtube' | 'tiktok' | 'instagram';


export class Video {
    constructor(
        public readonly id: string,
        public readonly url: string,
        public readonly platform: videoPlatforms,
        public readonly title: string,
        public readonly createdAt: Date,
        public readonly whiteboardId: string,
        public jobId?: string,
    )
        {

        }
    


}