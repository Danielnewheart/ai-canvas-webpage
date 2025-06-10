"use client";

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Search, Loader2 } from 'lucide-react';
interface ChatPanelProps {
  onCitationClick?: (url: string, title?: string) => void;
}

interface Citation {
  url: string;
  title: string;
  index: number;
}

export default function ChatPanel({ onCitationClick }: ChatPanelProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  // Custom renderer for markdown links to handle citations
  const createCustomRenderers = (citations: Citation[]) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a: ({ href, children, ...props }: any) => {
      // Check if this is a citation link (contains utm_source=openai)
      if (href && href.includes('utm_source=openai')) {
        const citation = citations.find(c => c.url === href);
        if (citation) {
          return (
            <span className="inline-flex items-baseline">
              <button
                onClick={() => onCitationClick?.(citation.url, citation.title)}
                className="text-blue-300 hover:text-blue-200 underline cursor-pointer"
                title={citation.title}
              >
                <sup className="text-xs bg-blue-600 px-1 py-0.5 rounded ml-1">
                  {citation.index}
                </sup>
              </button>
            </span>
          );
        }
      }
      
      // Regular link handling
      return (
        <a 
          href={href} 
          className="text-blue-300 hover:text-blue-200 underline"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }
  });

  // Extract citations from message content
  const extractCitations = (content: string): Citation[] => {
    const citations: Citation[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+utm_source=openai[^)]*)\)/g;
    let match;
    let index = 1;

    while ((match = linkRegex.exec(content)) !== null) {
      const title = match[1];
      const url = match[2];
      
      // Check if this citation already exists
      if (!citations.find(c => c.url === url)) {
        citations.push({
          title,
          url,
          index: index++
        });
      }
    }

    return citations;
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m) => {
          const citations = m.role === 'assistant' ? extractCitations(m.content) : [];
          const customRenderers = createCustomRenderers(citations);

          return (
            <div
              key={m.id}
              className={`p-2 my-2 rounded-lg ${
                m.role === 'user' ? 'bg-blue-600 self-end' : 'bg-gray-700 self-start'
              }`}
            >
              <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
              
              {/* Display message content with custom renderers */}
              <div className="mt-1">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={customRenderers}
                >
                  {m.content}
                </ReactMarkdown>
              </div>

              {/* Display citation references at the bottom */}
              {citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-600">
                  <div className="text-xs text-gray-400 mb-1">參考來源：</div>
                  {citations.map((citation) => (
                    <div key={citation.index} className="flex items-start gap-1 mb-1">
                      <span className="text-blue-300 text-xs font-mono min-w-[20px]">
                        {citation.index}.
                      </span>
                      <button
                        onClick={() => onCitationClick?.(citation.url, citation.title)}
                        className="text-blue-300 hover:text-blue-200 text-xs underline cursor-pointer text-left flex-1"
                        title={citation.url}
                      >
                        <ExternalLink size={10} className="inline mr-1" />
                        {citation.title}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Search status indicator */}
        {isLoading && (
          <div className="p-2 my-2 rounded-lg bg-gray-600 self-start flex items-center gap-2">
            <div className="flex items-center gap-2 text-blue-300">
              <div className="relative">
                <Search size={16} />
                <Loader2 size={12} className="absolute -top-1 -right-1 animate-spin" />
              </div>
              <span className="text-sm">AI is searching the web...</span>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}; 