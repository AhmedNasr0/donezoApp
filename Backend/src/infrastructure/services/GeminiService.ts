import { LLMService } from '../../domain/services/LLMService'

import { GoogleGenAI } from "@google/genai"

export class GeminiService implements LLMService {
    private ai = new GoogleGenAI({
        apiKey:process.env.GEMINI_API_KEY || ''
    });

    async generateResponse(question: string, context: string): Promise<string> {
        // Placeholder for OpenAI integration
        // In real implementation, you would call OpenAI API here
        
        const prompt = `
        Based on the following transcriptions from videos, please answer the question:

        Context:${context}

        Question: ${question}

        Please provide a helpful answer based on the information from the video transcriptions.
        `
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        console.log(response.text);
        return response.text || ''
    }
    
}
