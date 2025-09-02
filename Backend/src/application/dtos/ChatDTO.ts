export interface CreateChatRequestDTO {
    chat_name: string;
    chat_messages?: any[];
    numOfConnections?: number;
    whiteboardId: string;
}

export interface UpdateChatRequestDTO {
    id: string;
    chat_name?: string;
    chat_messages?: any[];
    numOfConnections?: number;
}   