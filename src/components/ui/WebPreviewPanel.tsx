"use client";

import { useState } from 'react';
import { X, ExternalLink, RotateCcw, AlertCircle } from 'lucide-react';

interface WebPreviewPanelProps {
  url?: string;
  title?: string;
  onClose?: () => void;
  onAddToCanvas?: (url: string, title?: string) => void;
}

export default function WebPreviewPanel({ 
  url, 
  title, 
  onClose, 
  onAddToCanvas 
}: WebPreviewPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey(prev => prev + 1);
  };

  const handleAddToCanvas = () => {
    if (url && onAddToCanvas) {
      onAddToCanvas(url, title);
    }
  };

  if (!url) {
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
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">
            {title || new URL(url).hostname}
          </h3>
          <p className="text-sm text-gray-400 truncate">{url}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-gray-700 rounded-md transition-colors"
            title="Refresh"
          >
            <RotateCcw size={20} />
          </button>
          <a
            href={url}
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
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-red-400">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p className="text-lg">Failed to load content</p>
              <p className="text-sm text-gray-400 mt-2">
                This page may not allow embedding or may have loading issues.
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

        <iframe
          key={iframeKey}
          src={url}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title={title || "Web Preview"}
        />
      </div>

      {/* Footer */}
      {onAddToCanvas && (
        <div className="p-4 border-t border-gray-700">
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