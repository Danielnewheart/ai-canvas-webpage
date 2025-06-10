import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Remove edge runtime for now to fix deployment issues
// export const runtime = 'edge';

interface CanvasCard {
  title: string;
  url: string;
  content: string;
}

interface ProcessedMessage {
  role: string;
  content: string;
  canvasCards?: CanvasCard[];
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Process messages to extract and enhance canvas context
    const processedMessages = messages.map((message: ProcessedMessage) => {
      if (message.role === 'user' && message.content.includes('---Canvas Context---')) {
        const [userQuery, contextSection] = message.content.split('---Canvas Context---');
        
        // Extract cards from context
        const cardMatches = contextSection.match(/\[Card: ([^\]]+)\]\s*(?:URL: ([^\n]*))?\s*(?:Content: ([^\n\[]*))*/g);
        const extractedCards: CanvasCard[] = cardMatches?.map((match: string) => {
          const titleMatch = match.match(/\[Card: ([^\]]+)\]/);
          const urlMatch = match.match(/URL: ([^\n]*)/);
          const contentMatch = match.match(/Content: ([^\n\[]*)/);
          
          return {
            title: titleMatch?.[1]?.trim() || '',
            url: urlMatch?.[1]?.trim() || '',
            content: contentMatch?.[1]?.trim() || ''
          };
        }) || [];

        console.log('Extracted cards from context:', extractedCards);

        // Enhanced message with structured context
        return {
          ...message,
          content: userQuery.trim(),
          canvasCards: extractedCards
        };
      }
      return message;
    });

    // Check if any message has canvas context
    const hasCanvasContext = processedMessages.some((msg: ProcessedMessage) => msg.canvasCards?.length && msg.canvasCards.length > 0);
    const canvasCards = processedMessages.find((msg: ProcessedMessage) => msg.canvasCards)?.canvasCards || [];

    // Create enhanced system message based on whether canvas context exists
    const systemMessage = {
      role: 'system' as const,
      content: hasCanvasContext 
        ? `You are a professional and helpful AI assistant with web search capabilities. The user is working with a canvas that contains cards (notes and web content). Please follow these guidelines:

**Canvas Context Available:**
The user has referenced ${canvasCards.length} card(s) from their canvas:
${canvasCards.map((card: CanvasCard, index: number) => `
${index + 1}. **${card.title}**
   ${card.url ? `URL: ${card.url}` : ''}
   Content: ${card.content || 'No content preview available'}`).join('\n')}

**Instructions:**
1. **Prioritize Canvas Context**: Always reference and build upon the canvas cards when answering
2. **Web Search Enhancement**: Use web search to find current/additional information that complements the canvas content
3. **Contextual Responses**: Connect your answer to the specific cards mentioned by the user
4. **Clear References**: When referencing canvas cards, mention them by name (e.g., "Based on your [card title] card...")
5. **Structured Answers**: Use headings, bullet points, and clear organization
6. **Source Integration**: Combine insights from canvas cards with web search results
7. **Professional Tone**: Maintain a helpful, professional demeanor

Remember: The canvas cards represent the user's curated knowledge base. Your role is to enhance and connect this information with current data and insights.`
        : `You are a professional and helpful AI assistant with web search capabilities. Please follow these guidelines:

1. **Web Search Priority**: For questions about current events, recent developments, or information that may have changed since your training data, actively search the web
2. **Detailed Responses**: Always provide comprehensive, accurate answers with proper citations and sources
3. **Clear Structure**: Use headings, lists, and clear organization for your responses
4. **Complete Information**: Keep answers thorough and practical, not overly brief
5. **Professional Tone**: Respond in a friendly, professional manner

When users start referencing "@" mentions, they're working with a canvas system. Be ready to help them organize and connect information.`
    };

    // Debug: Log the processed information
    console.log('Has canvas context:', hasCanvasContext);
    if (hasCanvasContext) {
      console.log('Canvas cards:', canvasCards);
    }

    // Ensure messages include system prompt
    const messagesWithSystem = [systemMessage, ...processedMessages];

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