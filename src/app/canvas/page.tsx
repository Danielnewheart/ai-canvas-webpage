"use client";

import { useState, useCallback } from 'react';
import Canvas, { CanvasCard } from '@/components/canvas/Canvas';
import ChatPanel from '@/components/ui/ChatPanel';
import WebPreviewPanel from '@/components/ui/WebPreviewPanel';
import { ReactFlowProvider } from 'reactflow';
import { Resizable } from 're-resizable';
import { ExternalLink, X, MessageSquare } from 'lucide-react';

export default function CanvasPage() {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [addWebCardToCanvas, setAddWebCardToCanvas] = useState<((url: string) => Promise<void>) | null>(null);
  const [canvasCards, setCanvasCards] = useState<CanvasCard[]>([]);

  const handleCitationClick = (url: string, title?: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title || '');
    setShowPreview(true);
    setIsPreviewMinimized(false);
  };

  const handleClosePreview = () => {
    setIsPreviewMinimized(true);
  };

  const handleRestorePreview = () => {
    setIsPreviewMinimized(false);
  };

  const handleFullClosePreview = () => {
    setShowPreview(false);
    setIsPreviewMinimized(false);
    setPreviewUrl('');
    setPreviewTitle('');
  };

  const handleCloseChatPanel = () => {
    setIsChatMinimized(true);
  };

  const handleRestoreChatPanel = () => {
    setIsChatMinimized(false);
  };

  const handleFullCloseChatPanel = () => {
    setShowChatPanel(false);
    setIsChatMinimized(false);
  };

  const handleAddToCanvas = async (url: string) => {
    if (addWebCardToCanvas) {
      try {
        await addWebCardToCanvas(url);
        // Optionally close the preview after adding to canvas
        handleFullClosePreview();
      } catch (error) {
        console.error('Failed to add web card to canvas:', error);
      }
    }
  };

  const handleCanvasReady = useCallback((addWebCardFunction: (url: string) => Promise<void>) => {
    setAddWebCardToCanvas(() => addWebCardFunction);
  }, []);

  const handleCardsChange = useCallback((cards: CanvasCard[]) => {
    setCanvasCards(cards);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Canvas Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative">
        {/* Minimized Buttons - positioned in canvas top-right corner */}
        <div className="absolute top-4 right-4 z-50 flex flex-row-reverse gap-2">
          {/* Minimized Web Preview Button */}
          {showPreview && isPreviewMinimized && (
            <div className="relative">
              <button
                onClick={handleRestorePreview}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors group"
                title="Open Web Preview"
              >
                <ExternalLink size={20} />
              </button>
              <button
                onClick={handleFullClosePreview}
                className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Close Web Preview"
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          {/* Minimized Chat Panel Button */}
          {showChatPanel && isChatMinimized && (
            <div className="relative">
              <button
                onClick={handleRestoreChatPanel}
                className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-colors group"
                title="Open AI Chat"
              >
                <MessageSquare size={20} />
              </button>
              <button
                onClick={handleFullCloseChatPanel}
                className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Close AI Chat"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <ReactFlowProvider>
          <Canvas 
            onWebCardClick={handleCitationClick} 
            onCanvasReady={handleCanvasReady}
            onCardsChange={handleCardsChange}
          />
        </ReactFlowProvider>
      </div>

      {/* AI Chat Panel */}
      {showChatPanel && !isChatMinimized && (
        <Resizable
          className="flex-shrink-0 bg-gray-50 dark:bg-gray-800"
          defaultSize={{
            width: 400,
            height: '100%',
          }}
          minWidth={300}
          maxWidth={1200}
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: true,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          handleClasses={{ left: "z-10 bg-gray-600 hover:bg-blue-500 transition-colors w-2 h-full absolute top-0 -left-1 cursor-col-resize" }}
        >
          <ChatPanel 
            onCitationClick={handleCitationClick}
            canvasCards={canvasCards}
            onClose={handleCloseChatPanel}
          />
        </Resizable>
      )}



      {/* Web Preview Panel */}
      {showPreview && !isPreviewMinimized && (
        <Resizable
          className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
          defaultSize={{
            width: 400,
            height: '100%',
          }}
          minWidth={300}
          maxWidth={1200}
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: true,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          handleClasses={{ left: "z-10 bg-gray-600 hover:bg-blue-500 transition-colors w-2 h-full absolute top-0 -left-1 cursor-col-resize" }}
        >
          <WebPreviewPanel 
            url={previewUrl}
            title={previewTitle}
            onClose={handleClosePreview}
            onAddToCanvas={handleAddToCanvas}
          />
        </Resizable>
      )}
    </div>
  );
} 