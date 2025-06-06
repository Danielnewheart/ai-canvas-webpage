import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onDuplicate: () => void;
  onClose: () => void;
}

function ContextMenu({ x, y, onDuplicate, onClose }: ContextMenuProps) {
  return (
    <>
      {/* Invisible overlay to close menu when clicking outside */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* The actual context menu */}
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => {
            onDuplicate();
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        >
          Duplicate
        </button>
      </div>
    </>
  );
}

export default ContextMenu; 