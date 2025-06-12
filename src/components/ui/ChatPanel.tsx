"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Search, Loader2, X, Trash2 } from 'lucide-react';

interface CanvasCard {
  id: string;
  type: 'noteCard' | 'webCard';
  title: string;
  content: string;
  url?: string;
}

interface ChatPanelProps {
  onCitationClick?: (url: string, title?: string) => void;
  canvasCards?: CanvasCard[];
  onClose?: () => void;
  initialMessage?: string;
  shouldAutoSend?: boolean;
  onAutoSendStart?: () => void;
  onAutoSendComplete?: () => void;
}

interface Citation {
  url: string;
  title: string;
  index: number;
}

export default function ChatPanel({ 
  onCitationClick, 
  canvasCards = [], 
  onClose, 
  initialMessage, 
  shouldAutoSend = false, 
  onAutoSendStart,
  onAutoSendComplete 
}: ChatPanelProps) {
  const [originalUserMessage, setOriginalUserMessage] = useState<string>('');
  const [lastMessageWithContext, setLastMessageWithContext] = useState<string>('');
  
  const { messages, input, handleInputChange, handleSubmit, append, isLoading, setMessages } = useChat({
    onError: (error) => {
      console.error('Chat API Error:', error);
      alert(`An error occurred: ${error.message}. Please check the server logs for more details.`);
    },
    onFinish: () => {
      // Clear confirmed mentions after AI response
      setConfirmedMentions(new Set());
      // Don't clear originalUserMessage immediately as we need it for display
    },
  });
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [filteredCards, setFilteredCards] = useState<CanvasCard[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [confirmedMentions, setConfirmedMentions] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoSentRef = useRef<boolean>(false);
  const lastInitialMessageRef = useRef<string>('');

  // Handle auto-sending initial message
  useEffect(() => {
    // Reset hasAutoSentRef if we have a new message
    if (initialMessage !== lastInitialMessageRef.current) {
      hasAutoSentRef.current = false;
      lastInitialMessageRef.current = initialMessage || '';
    }
    
    if (shouldAutoSend && initialMessage && initialMessage.trim() && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      
      // Notify parent that auto-send is starting (to clear URL)
      onAutoSendStart?.();
      
      // Auto-submit the message directly
      append({
        role: 'user',
        content: initialMessage,
      }).then(() => {
        // Notify parent that auto-send is complete
        onAutoSendComplete?.();
      }).catch((error) => {
        console.error('Auto-send failed:', error);
      });
    }
  }, [shouldAutoSend, initialMessage]); // Remove append and onAutoSendComplete from dependencies

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
      
      // Regular link handling - open in WebPreviewPanel instead of new tab
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            if (href && onCitationClick) {
              // Extract title from link text, or use URL as fallback
              const linkTitle = typeof children === 'string' ? children : (Array.isArray(children) ? children.join('') : href);
              onCitationClick(href, linkTitle);
            }
          }}
          className="text-blue-300 hover:text-blue-200 underline cursor-pointer"
          title={`Open ${href} in preview panel`}
          {...props}
        >
          {children}
        </button>
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

  // Handle @ mention functionality
  const handleInputChangeWithMentions = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = e.target.value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if this looks like a mention (no spaces after @)
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setMentionQuery(textAfterAt);
        setMentionPosition(lastAtIndex);
        setShowMentions(true);
        
        // Filter cards based on query
        const filtered = canvasCards.filter(card => 
          card.title.toLowerCase().includes(textAfterAt.toLowerCase()) ||
          card.content.toLowerCase().includes(textAfterAt.toLowerCase())
        );
        setFilteredCards(filtered);
        setSelectedMentionIndex(0); // Reset selection to first item
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
    
    handleInputChange(e);
  };

  // Handle mention selection
  const handleMentionSelect = (card: CanvasCard) => {
    console.log('Selecting card:', card.title); // Debug
    
    const beforeMention = input.substring(0, mentionPosition);
    const afterMention = input.substring(mentionPosition + 1 + mentionQuery.length);
    
    // Use only the card title (which is already truncated appropriately)
    const mentionText = `@${card.title}`;
    const newValue = `${beforeMention}${mentionText} ${afterMention}`;
    
    console.log('New value will be:', newValue); // Debug
    
    // Add this mention to confirmed mentions
    setConfirmedMentions(prev => {
      const newSet = new Set([...prev, card.title]);
      console.log('Confirmed mentions:', Array.from(newSet)); // Debug
      return newSet;
    });
    
    // Update the input through the proper useChat mechanism
    const syntheticEvent = {
      target: { value: newValue }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleInputChange(syntheticEvent);
    
    // Set cursor position after the mention
    const newCursorPos = beforeMention.length + mentionText.length + 1; // +1 for space
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
    
    setShowMentions(false);
  };

  // Parse input to identify mentions and regular text
  const parseInputForMentions = (text: string) => {
    const parts: Array<{ type: 'text' | 'mention', content: string }> = [];
    
    console.log('Parsing text:', text); // Debug
    console.log('Confirmed mentions:', Array.from(confirmedMentions)); // Debug

    let currentIndex = 0;
    
    // Sort confirmed mentions by length (longest first) to avoid partial matches
    const sortedMentions = Array.from(confirmedMentions).sort((a, b) => b.length - a.length);
    
    while (currentIndex < text.length) {
      let foundMention = false;
      
      // Look for @ symbol
      if (text[currentIndex] === '@') {
        // Check each confirmed mention to see if it matches at this position
        for (const confirmedMention of sortedMentions) {
          const mentionPattern = `@${confirmedMention}`;
          if (text.substring(currentIndex, currentIndex + mentionPattern.length) === mentionPattern) {
            // Add any text before this mention
            if (currentIndex > 0 && parts.length === 0) {
              parts.push({
                type: 'text',
                content: text.substring(0, currentIndex)
              });
            }
            
            console.log('Found confirmed mention:', confirmedMention); // Debug
            parts.push({
              type: 'mention',
              content: confirmedMention
            });
            
            currentIndex += mentionPattern.length;
            foundMention = true;
            break;
          }
        }
      }
      
      if (!foundMention) {
        // Find the next mention or end of string
        let nextMentionIndex = text.length;
        for (const confirmedMention of sortedMentions) {
          const mentionPattern = `@${confirmedMention}`;
          const index = text.indexOf(mentionPattern, currentIndex + 1);
          if (index !== -1 && index < nextMentionIndex) {
            nextMentionIndex = index;
          }
        }
        
        // Add text from current position to next mention (or end)
        const textContent = text.substring(currentIndex, nextMentionIndex);
        if (textContent) {
          parts.push({
            type: 'text',
            content: textContent
          });
        }
        
        currentIndex = nextMentionIndex;
      }
    }
    
    console.log('Parsed parts:', parts); // Debug
    return parts;
  };

     // Extract mentioned cards and their content for context
   const extractMentionedCards = (text: string): CanvasCard[] => {
     const parts = parseInputForMentions(text);
     const mentionedCards: CanvasCard[] = [];
     
     for (const part of parts) {
       if (part.type === 'mention') {
         const card = canvasCards.find(c => c.title === part.content);
         if (card) {
           mentionedCards.push(card);
         }
       }
     }
     
     return mentionedCards;
   };

   // Custom submit handler that includes canvas context
   const handleSubmitWithContext = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     
     if (!input.trim()) return;
     
     // Extract mentioned cards
     const mentionedCards = extractMentionedCards(input);
     
     if (mentionedCards.length > 0) {
       // Store the original input to show in UI
       setOriginalUserMessage(input);
       
       // Create enriched message with canvas context
       const contextString = mentionedCards.map(card => {
         let contextInfo = `[Card: ${card.title}]`;
         if (card.type === 'webCard' && card.url) {
           contextInfo += `\nURL: ${card.url}`;
         }
         if (card.content) {
           contextInfo += `\nContent: ${card.content}`;
         }
         return contextInfo;
       }).join('\n\n');
       
       const enrichedMessage = `${input}\n\n---Canvas Context---\n${contextString}`;
       
       // Track this message for display purposes
       setLastMessageWithContext(enrichedMessage);
       
       // Use append to send the enriched message directly
       await append({
         role: 'user',
         content: enrichedMessage,
       });
       
       // Clear the input
       handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLTextAreaElement>);
       
     } else {
       // No mentions, clear any previous context tracking
       setOriginalUserMessage('');
       setLastMessageWithContext('');
       // Use normal submit
       handleSubmit(e);
     }
   };

   // Handle all keyboard interactions
   const handleKeyDownWithMentionDeletion = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // First, handle cmd/ctrl+Enter to submit the form
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      // Trigger form submission
      const form = inputRef.current?.closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
      return;
    }

    // Second, handle mention dropdown navigation if dropdown is open
    if (showMentions && filteredCards.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev < filteredCards.length - 1 ? prev + 1 : 0
          );
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : filteredCards.length - 1
          );
          return;
        case 'Enter':
          e.preventDefault();
          handleMentionSelect(filteredCards[selectedMentionIndex]);
          return;
        case 'Escape':
          e.preventDefault();
          setShowMentions(false);
          return;
      }
    }

    // Handle backspace for atomic mention deletion
    if (e.key === 'Backspace' && inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart || 0;
      const textBeforeCursor = input.substring(0, cursorPosition);
      
      // Check if cursor is right after a confirmed mention
      for (const confirmedMention of confirmedMentions) {
        const mentionPattern = `@${confirmedMention}`;
        if (textBeforeCursor.endsWith(mentionPattern)) {
          e.preventDefault();
          
          // Delete the entire mention
          const beforeMention = textBeforeCursor.substring(0, textBeforeCursor.length - mentionPattern.length);
          const afterCursor = input.substring(cursorPosition);
          const newValue = beforeMention + afterCursor;
          
          // Remove from confirmed mentions
          setConfirmedMentions(prev => {
            const newSet = new Set(prev);
            newSet.delete(confirmedMention);
            return newSet;
          });
          
          // Update input through proper mechanism
          const syntheticEvent = {
            target: { value: newValue }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          
          handleInputChange(syntheticEvent);
          
          // Set cursor position
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(beforeMention.length, beforeMention.length);
            }
          }, 0);
          
          return;
        }
      }
    }
  };

  // Clear conversation function
  const handleClearConversation = () => {
    setMessages([]);
    setOriginalUserMessage('');
    setLastMessageWithContext('');
    setConfirmedMentions(new Set());
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-lg font-semibold">AI Chat</h3>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              className="p-1 hover:bg-gray-700 rounded-md transition-colors"
              title="Clear Conversation"
            >
              <Trash2 size={20} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded-md transition-colors"
              title="Minimize Chat"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
                 {messages.map((m) => {
            const citations = m.role === 'assistant' ? extractCitations(m.content) : [];
            const customRenderers = createCustomRenderers(citations);
          
          // For user messages, check if this message has context and we should show the original
          const shouldShowOriginal = m.role === 'user' && m.content === lastMessageWithContext && originalUserMessage;
          const displayContent = shouldShowOriginal ? originalUserMessage : m.content;

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
                {shouldShowOriginal ? (
                  // Render the original message with mention chips
                  <div>
                    {parseInputForMentions(originalUserMessage).map((part, partIndex) => {
                      if (part.type === 'mention') {
                      return (
                          <span 
                            key={`mention-${partIndex}`}
                            className="bg-blue-500 text-white px-2 py-1 rounded mr-1"
                          >
                            @{part.content}
                          </span>
                        );
                      } else {
                        return (
                          <span key={`text-${partIndex}`}>
                            {part.content}
                          </span>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={customRenderers}
                  >
                    {displayContent}
                  </ReactMarkdown>
                )}
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
              <form onSubmit={handleSubmitWithContext} className="p-4 border-t border-gray-700">
        <div className="relative">
          {/* Mentions dropdown */}
          {showMentions && filteredCards.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {filteredCards.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleMentionSelect(card)}
                  className={`w-full text-left p-3 border-b border-gray-600 last:border-b-0 transition-colors ${
                    index === selectedMentionIndex 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">
                      {card.type === 'noteCard' ? 'Note' : 'Web'}
                    </span>
                    <span className="font-medium text-white truncate">{card.title}</span>
                  </div>
                  {card.content && (
                    <p className="text-sm text-gray-400 mt-1 truncate">{card.content}</p>
                  )}
                </button>
              ))}
            </div>
          )}
          
        <div className="flex items-center">
            <div className="flex-1 relative">
              {/* Textarea field with auto-resize */}
              <textarea
                ref={inputRef}
            value={input}
                onChange={handleInputChangeWithMentions}
                onKeyDown={handleKeyDownWithMentionDeletion}
                placeholder="Type a message... Use @ to mention cards, Cmd/Ctrl+Enter to send"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-transparent caret-white resize-none font-mono"
                style={{
                  minHeight: '40px',
                  maxHeight: '144px', // 6 lines * 24px line height
                  lineHeight: '24px',
                  fontSize: '14px',
                  letterSpacing: '0px',
                  wordSpacing: '0px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '40px'; // Reset height
                  const scrollHeight = Math.min(target.scrollHeight, 144); // Max 6 lines
                  target.style.height = scrollHeight + 'px';
                  if (target.scrollHeight > 144) {
                    target.style.overflowY = 'auto';
                  } else {
                    target.style.overflowY = 'hidden';
                  }
                }}
                onScroll={(e) => {
                  // Sync overlay scroll with textarea scroll
                  const target = e.target as HTMLTextAreaElement;
                  const overlay = target.nextElementSibling as HTMLElement;
                  if (overlay) {
                    overlay.scrollTop = target.scrollTop;
                  }
                }}
              />
              
              {/* Text and mention chips overlay */}
              <div 
                className="absolute inset-0 p-2 pointer-events-none overflow-auto font-mono"
                style={{
                  lineHeight: '24px',
                  fontSize: '14px',
                  letterSpacing: '0px',
                  wordSpacing: '0px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  maxHeight: '144px'
                }}
              >
                {parseInputForMentions(input).map((part, index) => {
                  if (part.type === 'mention') {
                    // Show the full mention text with blue background (same length as original)
                    return (
                      <span 
                        key={`mention-${index}`}
                        className="bg-blue-600 text-white px-1 rounded"
                        style={{ 
                          lineHeight: '24px',
                          fontSize: '14px',
                          letterSpacing: '0px',
                          wordSpacing: '0px'
                        }}
                      >
                        @{part.content}
                      </span>
                    );
                  } else {
                    // Show regular text as white, preserve exact spacing
                    return (
                      <span 
                        key={`text-${index}`}
                        className="text-white"
                        style={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: '24px',
                          fontSize: '14px',
                          letterSpacing: '0px',
                          wordSpacing: '0px'
                        }}
                      >
                        {part.content}
                      </span>
                    );
                  }
                })}
              </div>
            </div>
            
          <button
            type="submit"
              className="ml-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 self-end"
          >
            Send
          </button>
          </div>
        </div>
      </form>
    </div>
  );
}; 