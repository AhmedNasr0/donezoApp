import { ChatMessage } from "./chatMsg.entity";

export class Chat {
    constructor(
        public id: string,
        public chat_name: string,
        public numOfConnections: number = 0,
        public createdAt: Date = new Date(),
        public chat_messages: ChatMessage[] = [],
        public readonly whiteboardId: string,
    ) {}
}