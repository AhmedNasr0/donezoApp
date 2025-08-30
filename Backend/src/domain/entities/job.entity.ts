type StatusTypes = 'processing' | 'failed' | 'done' | 'pending'

export class Job {
    constructor(
        public readonly id: string,
        public status: StatusTypes,
        public readonly createdAt: Date,
        public readonly resourceId?: string,
        public transcription?: string,
        public error?: string
    ) {}

    markAsDone(transcription?: string): void {
        this.status = 'done'
        if (transcription) {
            this.transcription = transcription
        }
    }

    markAsPending(): void {
        this.status = 'pending'
    }

    markAsFailed(error?: string): void {
        this.status = 'failed'
        if (error) {
            this.error = error
        }
    }

    markAsProcessing(): void {
        this.status = 'processing'
    }
}