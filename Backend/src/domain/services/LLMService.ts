export interface LLMService  {
    generateResponse(question: string, context: string, chatHistory?: Array<{role: string, content: string}>): Promise<string>
}