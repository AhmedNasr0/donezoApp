export interface SendMessageRequestDTO {
    chatId: string;
    question: string;
}

export interface SendMessageResponseDTO {
    answer: string;
    messageId: string;
    context: string[];
}

export interface GetChatHistoryResponseDTO {
    messages: {
        id: string;
        role: 'user' | 'assistant';
        content: string;
        context: string[];
        createdAt: Date;
    }[];
    totalMessages: number;
}