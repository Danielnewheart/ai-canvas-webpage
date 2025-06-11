"use client";

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Node,
  useReactFlow,
  addEdge,
  Connection,
  Edge,
  ConnectionLineType,
} from 'reactflow';

import 'reactflow/dist/style.css';
import NoteCard from '../cards/NoteCard';
import WebCard from '../cards/WebCard';
import ContextMenu from '../ui/ContextMenu';

const initialNodes: Node[] = [
  { id: '1', type: 'noteCard', position: { x: 0, y: 0 }, data: { label: '<p>This card will grow as you type!</p><p>Once you resize it, it will have a fixed height and scrolling.</p>' }, style: { width: 250 } },
];

const nodeTypes = {
  noteCard: NoteCard,
  webCard: WebCard,
};

let id = 2;
const getId = () => `${id++}`;

interface CanvasProps {
  onWebCardClick?: (url: string, title?: string) => void;
  onCanvasReady?: (addWebCardFunction: (url: string) => Promise<void>) => void;
  onCardsChange?: (cards: CanvasCard[]) => void;
}

export interface CanvasCard {
  id: string;
  type: 'noteCard' | 'webCard';
  title: string;
  content: string;
  url?: string;
}

export default function Canvas({ onWebCardClick, onCanvasReady, onCardsChange }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Close context menu when clicking on pane
      setContextMenu(null);
      
      if (clickTimeout.current === null) {
        clickTimeout.current = setTimeout(() => {
          clickTimeout.current = null;
        }, 300);
      } else {
        // Double click
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
        
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode = {
          id: getId(),
          type: 'noteCard',
          position,
          data: { label: '<p>New Note</p>' },
          style: { width: 250, height: 320 },
        };
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [screenToFlowPosition, setNodes]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        nodeId: node.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find(n => n.id === nodeId);
      if (!nodeToDuplicate) return;
      
      const newNode = {
        ...nodeToDuplicate,
        id: getId(),
        position: {
          x: nodeToDuplicate.position.x + 20,
          y: nodeToDuplicate.position.y + 20,
        },
        selected: false,
      };
      
      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes]
  );

  // URL detection utility
  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Fetch URL metadata and create WebCard
  const createWebCard = useCallback(
    async (url: string, position: { x: number; y: number }) => {
      try {
        console.log('Creating web card for URL:', url);
        const apiUrl = `/api/metadata?url=${encodeURIComponent(url)}`;
        console.log('Fetching metadata from:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Fetch response status:', response.status);
        
        const metadata = await response.json();
        console.log('Metadata response:', metadata);
        
        if (!response.ok) {
          console.error('Failed to fetch metadata:', metadata.error);
          // Create a basic web card even if metadata fetch fails
          const fallbackWebCard = {
            id: getId(),
            type: 'webCard',
            position,
            data: {
              url: url,
              title: new URL(url).hostname,
              siteName: new URL(url).hostname,
              onWebCardClick,
            },
            style: { width: 280, height: 160 },
          };
          setNodes((nds) => nds.concat(fallbackWebCard));
          return;
        }

        const newWebCard = {
          id: getId(),
          type: 'webCard',
          position,
          data: {
            ...metadata,
            onWebCardClick,
          },
          style: { width: 280, height: 160 },
        };

        setNodes((nds) => nds.concat(newWebCard));
      } catch (error) {
        console.error('Error creating web card:', error);
        // Create a basic web card even when there's a network error
        try {
          const fallbackWebCard = {
            id: getId(),
            type: 'webCard',
            position,
            data: {
              url: url,
              title: new URL(url).hostname,
              siteName: new URL(url).hostname,
              onWebCardClick,
            },
            style: { width: 280, height: 160 },
          };
          setNodes((nds) => nds.concat(fallbackWebCard));
        } catch (fallbackError) {
          console.error('Error even creating fallback web card:', fallbackError);
        }
      }
    },
    [setNodes, onWebCardClick]
  );

  // Function to add WebCard from preview panel
  const addWebCardFromPreview = useCallback(
    async (url: string) => {
      // Position the new card in a visible area of the canvas
      const position = { x: 100, y: 100 };
      await createWebCard(url, position);
    },
    [createWebCard]
  );

  // Extract card data for @ mention system
  const extractCardsData = useCallback((nodes: Node[]): CanvasCard[] => {
    return nodes.map(node => {
      if (node.type === 'noteCard') {
        // Extract text content from HTML
        const textContent = node.data.label?.replace(/<[^>]*>/g, '') || '';
        return {
          id: node.id,
          type: 'noteCard',
          title: textContent.substring(0, 50) + (textContent.length > 50 ? '...' : ''),
          content: textContent,
        };
      } else if (node.type === 'webCard') {
        return {
          id: node.id,
          type: 'webCard',
          title: node.data.title || node.data.siteName || 'Web Card',
          content: node.data.description || '',
          url: node.data.url,
        };
      }
      return {
        id: node.id,
        type: 'noteCard',
        title: 'Unknown Card',
        content: '',
      };
    });
  }, []);

  // Notify parent of card changes
  React.useEffect(() => {
    if (onCardsChange) {
      const cardsData = extractCardsData(nodes);
      onCardsChange(cardsData);
    }
  }, [nodes, onCardsChange, extractCardsData]);

  // Expose the addWebCardFromPreview function to parent
  React.useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(addWebCardFromPreview);
    }
  }, [onCanvasReady]); // Only depend on onCanvasReady to avoid infinite loop

  // Handle paste events for URL detection
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const pastedText = event.clipboardData?.getData('text') || '';
      
      if (isValidUrl(pastedText)) {
        event.preventDefault();
        
        // Get mouse position or use center of viewport
        const canvas = document.querySelector('.react-flow__renderer');
        const rect = canvas?.getBoundingClientRect();
        
        const position = screenToFlowPosition({
          x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
          y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
        });
        
        createWebCard(pastedText, position);
      }
    },
    [screenToFlowPosition, createWebCard]
  );

  // Add paste event listener
  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.Straight}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDuplicate={() => duplicateNode(contextMenu.nodeId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
} 