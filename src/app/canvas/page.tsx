export default function CanvasPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Canvas Area */}
      <div className="flex-1 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-full">
          <p className="text-2xl text-gray-400">Canvas Area</p>
        </div>
      </div>

      {/* AI Chat Panel */}
      <div className="w-96 bg-gray-50 p-4">
        <div className="flex flex-col h-full">
          <div className="flex-1 mb-4">
            <p className="text-xl font-semibold text-gray-800">AI Chat</p>
            {/* Chat messages will go here */}
          </div>
          <div>
            <input
              type="text"
              placeholder="Ask a follow-up..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 