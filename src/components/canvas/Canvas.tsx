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
import ContextMenu from '../ui/ContextMenu';

const initialNodes: Node[] = [
  { id: '1', type: 'noteCard', position: { x: 0, y: 0 }, data: { label: '<p>This card will grow as you type!</p><p>Once you resize it, it will have a fixed height and scrolling.</p>' }, style: { width: 250 } },
];

const nodeTypes = {
  noteCard: NoteCard,
};

let id = 2;
const getId = () => `${id++}`;

export default function Canvas() {
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
          style: { width: 250 },
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