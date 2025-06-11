import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import * as cheerio from 'cheerio';

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

// Helper function to detect if query needs web search
function needsWebSearch(query: string): boolean {
  const searchKeywords = [
    '最新', '新聞', '趨勢', '目前', '現在', '今天', '最近', '2024', '2025',
    'latest', 'news', 'current', 'today', 'recent', 'trending', 'now',
    '價格', '股價', '匯率', '市場', 'price', 'stock', 'market',
    '評價', '比較', '推薦', 'review', 'comparison', 'recommend',
    '怎麼', '如何', '方法', 'how to', 'tutorial', 'guide'
  ];
  
  return searchKeywords.some(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Enhanced system prompts with stronger web search emphasis
const getSystemPrompt = (hasCanvasContext: boolean, canvasCards: CanvasCard[], userQuery: string) => {
  const needsSearch = needsWebSearch(userQuery);
  const searchEmphasis = needsSearch ? "**CRITICAL: This query requires current information - prioritize web search!**\n\n" : "";
  
  const baseInstructions = `${searchEmphasis}You are an AI assistant with advanced web search capabilities. Your primary strength is providing comprehensive, detailed, and actionable information from the web.

**RESPONSE STYLE & FORMAT:**
1. **Comprehensive Detail**: Provide thorough, in-depth information rather than brief summaries
2. **Structured Layout**: Use clear headings, bullet points, numbered lists, and visual formatting
3. **Specific Information**: Include exact titles, authors, dates, and detailed content descriptions
4. **Actionable Insights**: Break down complex information into digestible, practical points
5. **Professional Formatting**: Use emojis (✅, 📈, 💡, 🎯) and visual elements to enhance readability
6. **Complete Context**: Provide full background and detailed explanations

**WEB SEARCH STRATEGY:**
1. **Always Search First**: For ANY question that could benefit from current information, search the web before responding
2. **Multiple Sources**: Aim to find and cite at least 2-3 credible sources per topic
3. **Source Quality**: Prioritize authoritative sources (official websites, reputable news outlets, academic sources)
4. **Recency Check**: Always look for the most recent information available
5. **Fact Verification**: Cross-reference information across multiple sources

**DETAILED RESPONSE STRUCTURE:**
1. **Opening Summary**: Brief context-setting paragraph
2. **Main Content**: Detailed sections with:
   - ✅ Clear visual indicators
   - **Bold titles and authors**
   - (Publication dates in parentheses)
   - Comprehensive bullet point breakdowns
   - Specific details about content, methodology, findings
3. **Additional Context**: Related information and background
4. **Actionable Recommendations**: Specific next steps or suggestions
5. **Sources**: Properly formatted reference list

**SEARCH TRIGGERS** (Always search for these topics):
- Current events, news, or recent developments
- Pricing, market data, or financial information  
- Product reviews, comparisons, or recommendations
- Technical tutorials or how-to guides
- Industry trends or analysis
- Any question containing dates (2024, 2025, etc.)

**TONE**: Professional, helpful, comprehensive, and detail-oriented. Prioritize being thorough over being brief.`;

  if (hasCanvasContext) {
    return {
      role: 'system' as const,
      content: `${baseInstructions}

**CANVAS INTEGRATION:**
You have access to ${canvasCards.length} card(s) from the user's canvas:
${canvasCards.map((card: CanvasCard, index: number) => `
${index + 1}. **${card.title}**
   ${card.url ? `URL: ${card.url}` : ''}
   Content: ${card.content || 'No content preview available'}`).join('\n')}

**Canvas + Web Search Strategy:**
1. **Context First**: Reference relevant canvas cards with detailed analysis
2. **Web Enhancement**: Search for current information that builds upon or updates canvas content
3. **Connection Points**: Explicitly connect web findings to canvas information with specific examples
4. **Knowledge Gaps**: Use web search to fill any information gaps from canvas cards
5. **Comprehensive Integration**: Create detailed, structured responses that combine canvas and web data

**Enhanced Canvas Response Format:**
- ✅ Start each relevant item with a checkmark
- **Bold titles** with author names and (publication dates)
- Detailed bullet-point breakdowns of content
- Specific insights and key takeaways
- Clear section separations
- Actionable recommendations based on combined information

Remember: Canvas cards are your starting point, but web search provides the current context and additional depth. Always prioritize comprehensive, detailed responses over brief summaries.`
    };
  }

  return {
    role: 'system' as const,
    content: baseInstructions
  };
};

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
    
    // If there are canvas cards, fetch full content for any web cards
    if (hasCanvasContext && canvasCards.length > 0) {
      console.log('Fetching content for web cards...');
      for (const card of canvasCards) {
        if (card.url) { // Heuristic to identify web cards
          try {
            console.log(`Fetching ${card.url}...`);
            const response = await fetch(card.url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });
            if (response.ok) {
              const html = await response.text();
              const $ = cheerio.load(html);
              
              // Remove script, style, nav, header, footer tags for cleaner content
              $('script, style, nav, header, footer, aside').remove();
              
              const mainContent = $('body').text();
              
              // Clean up whitespace and limit content size
              const cleanedContent = mainContent.replace(/\s\s+/g, ' ').trim();
              card.content = cleanedContent.substring(0, 8000); // Limit to ~8k characters
              
              console.log(`Successfully fetched and processed content for ${card.title}. Content length: ${card.content.length}`);
            } else {
              console.warn(`Failed to fetch ${card.url}. Status: ${response.status}`);
              card.content = `[Could not fetch content from URL: ${card.url}]`;
            }
          } catch (error) {
            console.error(`Error fetching or parsing ${card.url}:`, error);
            card.content = `[Error fetching content from URL: ${card.url}]`;
          }
        }
      }
      console.log('Finished fetching web card content.');
    }

    // Get the latest user query for search analysis
    const latestUserMessage = processedMessages.filter((msg: ProcessedMessage) => msg.role === 'user').pop();
    const userQuery = latestUserMessage?.content || '';

    // Create enhanced system message with improved web search strategy
    const systemMessage = getSystemPrompt(hasCanvasContext, canvasCards, userQuery);

    // Debug: Log the processed information
    console.log('Has canvas context:', hasCanvasContext);
    console.log('Needs web search:', needsWebSearch(userQuery));
    if (hasCanvasContext) {
      console.log('Canvas cards:', canvasCards);
    }

    // Ensure messages include system prompt
    const messagesWithSystem = [systemMessage, ...processedMessages];

    // Enhanced model configuration for comprehensive, detailed responses
    const result = await streamText({
      model: openai('gpt-4o-search-preview'), // Dedicated search model with enhanced capabilities
      messages: messagesWithSystem,
      temperature: 0.1, // Very low temperature for consistent, detailed formatting
      maxTokens: 4000, // Higher token limit for comprehensive, detailed responses
      // Additional options to encourage web search and detailed responses
      experimental_providerMetadata: {
        openai: {
          search: {
            enabled: true,
            // Force search for queries that need current information
            forceSearch: needsWebSearch(userQuery)
          }
        }
      }
    });

    return result.toDataStreamResponse({
      sendSources: true, // Always include sources
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 