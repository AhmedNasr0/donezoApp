import { LLMService } from '../../domain/services/LLMService'

import { GoogleGenAI } from "@google/genai"
import { getfullPrompt } from '../../shared/utils/Prompt';

export class GeminiService implements LLMService {
    private ai = new GoogleGenAI({
        apiKey:process.env.GEMINI_API_KEY || ''
    });

    async generateResponse(question: string, context: string, chatHistory?: Array<{role: string, content: string}>): Promise<string> {
        // Placeholder for OpenAI integration
        // In real implementation, you would call OpenAI API here
        
        const prompt = getfullPrompt(question, context, chatHistory)
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text || ''
    }
    
}
