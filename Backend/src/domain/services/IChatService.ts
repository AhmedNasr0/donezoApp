export interface IChatService {
    generateResponse(question: string, context: string): Promise<string>
}