export interface CreateChatRequestDTO {
    chat_name: string;
    chat_messages?: any[];
    numOfConnections?: number;
}

export interface UpdateChatRequestDTO {
    id: string;
    chat_name?: string;
    chat_messages?: any[];
    numOfConnections?: number;
}   