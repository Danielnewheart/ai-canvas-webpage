import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Remove edge runtime for now to fix deployment issues
// export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Add system message to improve response quality and ensure sources are provided
    const systemMessage = {
      role: 'system' as const,
      content: `You are a professional and helpful AI assistant with web search capabilities. Please follow these guidelines:

1. For questions about current events, recent developments, or information that may have changed since your training data, actively search the web to provide up-to-date information
2. Always provide detailed, accurate answers with proper citations and sources when you use web search
3. Use clear structure to organize your answers, using headings, lists, etc.
4. Keep answers complete and practical, not overly brief
5. When a user message contains "---Canvas Context---" section, pay special attention to the canvas cards referenced there. Use the content from those cards to provide more contextual and relevant answers.
6. The canvas context will contain card information in the format:
   [Card: Title]
   URL: (if applicable)
   Content: (the actual content)
7. Always prioritize and reference the canvas context when available, but also search for current information when needed
8. Respond in a friendly, professional tone`
    };

    // Debug: Log the received messages to see if context is included
    console.log(
      'systemMessage', systemMessage,
      'Received messages:', JSON.stringify(messages, null, 2)
    );

    // Ensure messages include system prompt
    const messagesWithSystem = [systemMessage, ...messages];

    // Use the dedicated search model for consistent web search functionality
    const result = await streamText({
      model: openai('gpt-4o-search-preview'), // Dedicated search model
      messages: messagesWithSystem,
      temperature: 1,
      maxTokens: 2048,
    });

    return result.toDataStreamResponse({
      sendSources: true, // Include sources in the response
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 