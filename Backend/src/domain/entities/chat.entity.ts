export class ChatMessage {
    constructor(
        public readonly id: string,
        public readonly question: string,
        public readonly answer: string,
        public readonly context: string[],
        public readonly createdAt: Date
    ) {}
}