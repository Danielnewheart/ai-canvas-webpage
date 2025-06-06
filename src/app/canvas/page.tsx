"use client";

import Canvas from '@/components/canvas/Canvas';
import ChatPanel from '@/components/ui/ChatPanel';
import { ReactFlowProvider } from 'reactflow';

export default function CanvasPage() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Canvas Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
      </div>

      {/* AI Chat Panel */}
      <div className="w-96 bg-gray-50 dark:bg-gray-800">
        <ChatPanel />
      </div>
    </div>
  );
} 