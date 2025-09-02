import { LLMService } from '../../domain/services/LLMService'

import Groq from "groq-sdk";



export class GroqService implements LLMService {
    private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    async generateResponse(question: string, context: string): Promise<string> {
        
        const prompt = `
        Based on the following transcriptions from videos, please answer the question:

        Context:${context}

        Question: ${question}

        Please provide a helpful answer based on the information from the video transcriptions.
        `
        const completion = await this.groq.chat.completions
        .create({
            messages: [
                {
                role: "user",
                content: prompt,
                },
                ],
                model: "openai/gpt-oss-20b",
        });
        const response = await completion.choices[0]?.message?.content

        return response || ''
    }
    
}
