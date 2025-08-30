export interface LLMService  {
    generateResponse(question: string, chatId: string): Promise<string>
}