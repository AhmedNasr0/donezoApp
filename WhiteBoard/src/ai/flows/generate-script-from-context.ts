'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerateScriptInput {
  prompt: string;
  context?: string;
}

export interface GenerateScriptOutput {
  script: string;
}

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error('Google AI API key not configured. Please set GOOGLE_GENAI_API_KEY in your .env file.');
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
  }
  return genAI;
}

export async function generateScriptFromContext(input: GenerateScriptInput): Promise<GenerateScriptOutput> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // Using a stable Gemini model
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    let fullPrompt = `You are an expert scriptwriter and creative assistant named Meedro. Your goal is to help content creators, marketers, and creative agencies.

The user has provided a prompt and may have provided some context from their whiteboard. Use this information to generate a helpful response.

If context is provided, use it as the primary source of information.

User Prompt:
${input.prompt}
`;

    if (input.context) {
      fullPrompt += `
Context from Whiteboard:
---
${input.context}
---
`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('The AI model did not return a valid response.');
    }
    return { script: text };

  } catch (error: any) {
    console.error("Error calling Google AI model:", error);
    if (error.message.includes('API key not configured')) {
      return { script: "I'm not configured to work without an AI model. Please add your Google AI API key to the environment variables." };
    }
    if (error.message.includes('model not found') || error.message.includes('quota')) {
      return { script: "Google AI is not properly configured or has exceeded its quota. Please make sure your API key is set correctly in the .env file and check your billing details." };
    }
    return { script: `I'm sorry, I encountered an error and couldn't process your request. Please check the server logs for details.\n\nError: ${error.message}` };
  }
}
