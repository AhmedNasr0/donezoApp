export interface IChatService {
    generateResponse(question: string, chatId: string): Promise<string>
}