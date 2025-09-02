export class ChatMessage {
    constructor(
        public id: string,
        public chatId: string,
        public role: 'user' | 'assistant',
        public content: string,
        public context: string[] = [],
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) {}

    static fromDatabase(row: any): ChatMessage {
        return new ChatMessage(
            row.id,
            row.chat_id,
            row.role,
            row.content,
            row.context || [],
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }

    toDatabase() {
        return {
            id: this.id,
            chat_id: this.chatId,
            role: this.role,
            content: this.content,
            context: this.context,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString()
        };
    }
}