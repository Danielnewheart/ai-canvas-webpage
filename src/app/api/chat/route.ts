import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: openai.responses('gpt-4o'),
      messages,
      temperature: 0,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: 'high',
        }),
      },
      maxSteps: 5,
    });

    return result.toDataStreamResponse({
      sendSources: true, // Include sources in the response
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 