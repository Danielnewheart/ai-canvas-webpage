"use client";

import { useState, useCallback } from 'react';
import Canvas from '@/components/canvas/Canvas';
import ChatPanel from '@/components/ui/ChatPanel';
import WebPreviewPanel from '@/components/ui/WebPreviewPanel';
import { ReactFlowProvider } from 'reactflow';

export default function CanvasPage() {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [addWebCardToCanvas, setAddWebCardToCanvas] = useState<((url: string) => Promise<void>) | null>(null);

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

  const handleAddToCanvas = async (url: string) => {
    if (addWebCardToCanvas) {
      try {
        await addWebCardToCanvas(url);
        // Optionally close the preview after adding to canvas
        handleClosePreview();
      } catch (error) {
        console.error('Failed to add web card to canvas:', error);
      }
    }
  };

  const handleCanvasReady = useCallback((addWebCardFunction: (url: string) => Promise<void>) => {
    setAddWebCardToCanvas(() => addWebCardFunction);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Canvas Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <ReactFlowProvider>
          <Canvas 
            onWebCardClick={handleCitationClick} 
            onCanvasReady={handleCanvasReady}
          />
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