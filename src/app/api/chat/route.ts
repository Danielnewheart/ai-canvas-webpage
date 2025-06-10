import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Debug: Log the received messages to see if context is included
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    // Add system message to improve response quality and ensure sources are provided
    const systemMessage = {
      role: 'system' as const,
      content: `You are a professional and helpful AI assistant. Please follow these guidelines:

1. Provide detailed, useful, and accurate answers
2. When using web search functionality, clearly cite and list all sources in your response
3. Use clear structure to organize your answers, using headings, lists, etc.
4. Keep answers complete and practical, not overly brief
5. When a user message contains "---Canvas Context---" section, pay special attention to the canvas cards referenced there. Use the content from those cards to provide more contextual and relevant answers.
6. The canvas context will contain card information in the format:
   [Card: Title]
   URL: (if applicable)
   Content: (the actual content)
7. Always prioritize and reference the canvas context when available
8. Respond in a friendly, professional tone`
    };

    // Ensure messages include system prompt
    const messagesWithSystem = [systemMessage, ...messages];

    const result = await streamText({
      model: openai.responses('gpt-4o-mini'), // Use responses API with correct model
      messages: messagesWithSystem,
      temperature: 0.7, // Increased temperature for more natural responses
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: 'high',
        }),
      },
      maxSteps: 5,
      // Add additional configuration to encourage better responses
      maxTokens: 2048, // Allow longer responses
    });

    return result.toDataStreamResponse({
      sendSources: true, // Include sources in the response
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 