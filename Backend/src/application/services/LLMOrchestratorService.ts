import { LLMService } from "../../domain/services/LLMService";

export class LLMOrchestratorService implements LLMService {
    constructor(
        private primary: LLMService,
        private secondary: LLMService
    ) {}

    async generateResponse(question: string, context: string, chatHistory?: Array<{role: string, content: string}>): Promise<string> {
        try {
        return await this.primary.generateResponse(question, context, chatHistory);
        } catch (error) {
        console.warn("Primary LLM failed, falling back to secondary...", error);
        return await this.secondary.generateResponse(question, context, chatHistory);
        }
    }
}