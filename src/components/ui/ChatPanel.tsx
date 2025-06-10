"use client";

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Search, Loader2 } from 'lucide-react';

interface ChatPanelProps {
  onCitationClick?: (url: string, title?: string) => void;
}

export default function ChatPanel({ onCitationClick }: ChatPanelProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 my-2 rounded-lg ${
              m.role === 'user' ? 'bg-blue-600 self-end' : 'bg-gray-700 self-start'
            }`}
          >
            <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
            
            {/* Display message content */}
            <div className="mt-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.content}
              </ReactMarkdown>
            </div>

            {/* Display sources if available */}
            {m.role === 'assistant' && 'parts' in m && m.parts && (
              <div className="mt-2">
                {m.parts
                  .filter((part) => part.type === 'source')
                  .map((part, index: number) => {
                    if (part.type === 'source') {
                      return (
                        <div key={index} className="mt-1">
                          <button
                            onClick={() => onCitationClick?.(part.source.url, part.source.title)}
                            className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 text-sm underline cursor-pointer"
                          >
                            <ExternalLink size={12} />
                            {part.source.title || new URL(part.source.url).hostname}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            )}
          </div>
        ))}
        
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