export interface CreateChatRequestDTO {
    id?: string;
    chat_name: string;
    chat_messages?: any[];
    numOfConnections?: number;
    whiteboardId: string;
    whiteboardItemId?: string;
}

export interface UpdateChatRequestDTO {
    id: string;
    chat_name?: string;
    chat_messages?: any[];
    numOfConnections?: number;
}   