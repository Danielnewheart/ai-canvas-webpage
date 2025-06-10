"use client";

import { useState } from 'react';
import Canvas from '@/components/canvas/Canvas';
import ChatPanel from '@/components/ui/ChatPanel';
import WebPreviewPanel from '@/components/ui/WebPreviewPanel';
import { ReactFlowProvider } from 'reactflow';

export default function CanvasPage() {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleCitationClick = (url: string, title?: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title || '');
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewUrl('');
    setPreviewTitle('');
  };

  const handleAddToCanvas = (url: string, title?: string) => {
    // TODO: Implement add to canvas functionality in future task
    console.log('Add to canvas:', { url, title });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Canvas Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <ReactFlowProvider>
          <Canvas onWebCardClick={handleCitationClick} />
        </ReactFlowProvider>
      </div>

      {/* AI Chat Panel */}
      <div className="w-96 bg-gray-50 dark:bg-gray-800">
        <ChatPanel onCitationClick={handleCitationClick} />
      </div>

      {/* Web Preview Panel */}
      {showPreview && (
        <div className="w-96 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <WebPreviewPanel 
            url={previewUrl}
            title={previewTitle}
            onClose={handleClosePreview}
            onAddToCanvas={handleAddToCanvas}
          />
        </div>
      )}
    </div>
  );
} 