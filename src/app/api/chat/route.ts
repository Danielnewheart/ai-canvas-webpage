import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Add system message to improve response quality and ensure sources are provided
    const systemMessage = {
      role: 'system' as const,
      content: `你是一個專業且樂於助人的 AI 助手。請遵循以下準則：

1. 提供詳細、有用且準確的回答
2. 當使用網路搜尋功能時，務必在回答中明確引用和列出所有來源
3. 用清晰的結構組織你的回答，使用標題、列表等格式
4. 保持回答的完整性和實用性，不要過於簡短
5. 當提供網路搜尋結果時，請包含：
   - 來源的標題
   - 來源的 URL
   - 相關的摘要或引用
6. 以友善、專業的語調回應`
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