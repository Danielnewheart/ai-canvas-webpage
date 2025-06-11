"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ExternalLink, RotateCcw, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface WebPreviewPanelProps {
  url?: string;
  title?: string;
  onClose?: () => void;
  onAddToCanvas?: (url: string) => void;
}

export default function WebPreviewPanel({ 
  url, 
  title, 
  onClose, 
  onAddToCanvas 
}: WebPreviewPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [content, setContent] = useState('');
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentUrl = history[historyIndex];
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  useEffect(() => {
    if (url) {
      setHistory([url]);
      setHistoryIndex(0);
      fetchContent(url);
    } else {
      setHistory([]);
      setHistoryIndex(-1);
      setContent('');
    }
  }, [url]);

  const fetchContent = useCallback(async (fetchUrl: string) => {
    setIsLoading(true);
    setHasError(false);
    setContent('');
    try {
      const apiUrl = `${window.location.origin}/api/browse?url=${encodeURIComponent(fetchUrl)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      setContent(html);
    } catch (error) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const navigateTo = useCallback((newUrl: string) => {
    // Prevent navigating to the same URL
    if (newUrl === currentUrl) return;

    // Truncate forward-history if we are navigating from a previous point
    const newHistory = history.slice(0, historyIndex + 1);
    
    newHistory.push(newUrl);
    setHistory(newHistory);
    
    const newIndex = newHistory.length - 1;
    setHistoryIndex(newIndex);
    
    fetchContent(newUrl);
  }, [history, historyIndex, currentUrl, fetchContent]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Find the closest anchor tag
      const link = target.closest('a');

      if (link && link.href) {
        // Handle links that open in a new tab
        if (link.target === '_blank') {
          window.open(link.href, '_blank', 'noopener,noreferrer');
          event.preventDefault();
          return;
        }

        // Prevent default navigation for internal links
        event.preventDefault();
        navigateTo(link.href);
      }
    };

    contentElement.addEventListener('click', handleClick);

    return () => {
      contentElement.removeEventListener('click', handleClick);
    };
  }, [content, navigateTo]);

  const handleBack = () => {
    if (canGoBack) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      fetchContent(history[newIndex]);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      fetchContent(history[newIndex]);
    }
  };

  const handleRefresh = () => {
    if (currentUrl) {
      fetchContent(currentUrl);
    }
  };

  const handleAddToCanvas = () => {
    if (currentUrl && onAddToCanvas) {
      onAddToCanvas(currentUrl);
    }
  };

  if (!currentUrl) {
    return (
      <div className="flex flex-col h-full bg-gray-800 text-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Web Preview</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <ExternalLink size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No URL to preview</p>
            <p className="text-sm mt-2">Click on a citation link or web card to view content here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
        <div className="flex flex-col h-full bg-gray-800 text-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={!canGoBack}
                className="p-1 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={handleForward}
                disabled={!canGoForward}
                className="p-1 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Forward"
              >
                <ArrowRight size={20} />
              </button>
              <button
                onClick={handleRefresh}
                className="p-1 hover:bg-gray-700 rounded-md transition-colors"
                title="Refresh"
              >
                <RotateCcw size={20} />
              </button>
          </div>
          <div className="flex-1 min-w-0 mx-4">
            <h3 className="text-lg font-semibold truncate text-center">
              {title || new URL(currentUrl).hostname}
            </h3>
            <p className="text-sm text-gray-400 truncate text-center">{currentUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-gray-700 rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </a>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-700 rounded-md transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 relative bg-white overflow-y-auto"
          style={{ contain: 'layout paint style' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p>Loading...</p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
              <div className="text-center text-red-400 p-4 rounded-lg bg-gray-900">
                <AlertCircle size={48} className="mx-auto mb-4" />
                <p className="text-lg">Failed to load content</p>
                <p className="text-sm text-gray-400 mt-2">
                  {errorMessage}
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          <div
            className="w-full"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Footer */}
        {onAddToCanvas && (
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <button
              onClick={handleAddToCanvas}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add to Canvas
            </button>
          </div>
        )}
      </div>
  );
} 