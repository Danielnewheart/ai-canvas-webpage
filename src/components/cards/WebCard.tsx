import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { NodeResizer, OnResizeEnd, ResizeParams } from '@reactflow/node-resizer';
import { ExternalLink, Globe } from 'lucide-react';

import 'reactflow/dist/style.css';
import '@reactflow/node-resizer/dist/style.css';

interface WebCardData {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
  image?: string;
  siteName?: string;
  isResized?: boolean;
  onWebCardClick?: (url: string, title?: string) => void;
}

function WebCard({ id, data, selected }: NodeProps<WebCardData>) {
  const { setNodes, getNodes } = useReactFlow();

  const onResizeEnd: OnResizeEnd = (_, params: ResizeParams) => {
    const nodes = getNodes();
    setNodes(
      nodes.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            style: { ...n.style, width: params.width, height: params.height },
            data: { ...n.data, isResized: true },
          };
        }
        return n;
      })
    );
  };

  const handleCardClick = () => {
    if (data.onWebCardClick) {
      data.onWebCardClick(data.url, data.title);
    }
  };

  const hostname = new URL(data.url).hostname;
  const displayTitle = data.title || hostname;
  const displaySiteName = data.siteName || hostname;

  return (
    <div className="bg-white rounded-md shadow-lg border border-gray-200 w-full h-full overflow-hidden">
      <NodeResizer
        isVisible={selected}
        minWidth={250}
        minHeight={140}
        onResizeEnd={onResizeEnd}
      />

      {/* Drag handle */}
      <div className="w-full h-5 bg-gray-100 rounded-t-md cursor-grab active:cursor-grabbing"></div>
      
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      {/* Card content */}
      <div 
        className={`nodrag w-full h-full cursor-pointer hover:bg-gray-50 transition-colors ${
          data.isResized ? 'overflow-hidden' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Header with favicon and external link */}
        <div className="flex items-center justify-between p-3 pb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {data.favicon ? (
              <img 
                src={data.favicon} 
                alt="" 
                className="w-4 h-4 flex-shrink-0"
                onError={(e) => {
                  // Fallback to globe icon if favicon fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <Globe size={16} className={`text-gray-400 flex-shrink-0 ${data.favicon ? 'hidden' : ''}`} />
            <span className="text-xs text-gray-500 truncate">{displaySiteName}</span>
          </div>
          <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
        </div>

        {/* Image preview */}
        {data.image && (
          <div className="px-3 pb-2">
            <img 
              src={data.image}
              alt=""
              className="w-full h-20 object-cover rounded-md border border-gray-100"
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Title and description */}
        <div className="px-3 pb-3">
          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
            {displayTitle}
          </h3>
          {data.description && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {data.description}
            </p>
          )}
        </div>

        {/* URL */}
        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
          <p className="text-xs text-gray-500 truncate" title={data.url}>
            {data.url}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

export default WebCard; 