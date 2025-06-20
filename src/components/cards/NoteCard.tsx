import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { NodeResizer, OnResizeEnd, ResizeParams } from '@reactflow/node-resizer';

import 'reactflow/dist/style.css';
import '@reactflow/node-resizer/dist/style.css';
import './NoteCard.css';

interface NoteCardData {
  label: string;
  isResized?: boolean;
}

function NoteCard({ id, data, selected }: NodeProps<NoteCardData>) {
  const { setNodes, getNodes } = useReactFlow();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading levels that are too large for a card
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: data.label,
    editorProps: {
      attributes: {
        // The editor itself should not scroll, its parent will.
        class: `prose prose-sm focus:outline-none w-full`,
      },
      transformPastedHTML: (html) => {
        // Remove problematic images and clean up HTML when pasting
        return html
          .replace(/<img[^>]*src="\/assets\/[^"]*"[^>]*>/gi, '') // Remove relative asset images
          .replace(/<img[^>]*src="assets\/[^"]*"[^>]*>/gi, '') // Remove relative asset images without leading slash
          .replace(/<img[^>]*src="[^"]*logo[^"]*"[^>]*>/gi, '') // Remove logo images
          .replace(/<img[^>]*data-src="[^"]*"[^>]*>/gi, '') // Remove lazy loaded images
          .replace(/<picture[^>]*>[\s\S]*?<\/picture>/gi, '') // Remove picture elements
          .replace(/<source[^>]*>/gi, ''); // Remove source elements
      },
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      const nodes = getNodes();
      setNodes(
        nodes.map((n) => {
          if (n.id === id) {
            return { ...n, data: { ...n.data, label: html } };
          }
          return n;
        })
      );
    },
  });

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

  return (
    <div 
      className="bg-white rounded-md shadow-lg border border-gray-200 w-full"
      style={{ height: data.isResized ? '100%' : '320px' }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={120}
        maxHeight={640}
        onResizeEnd={onResizeEnd}
      />

      <div className="w-full h-5 bg-gray-100 rounded-t-md cursor-grab active:cursor-grabbing"></div>
      
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div className={`nodrag w-full p-4 overflow-y-auto`} style={{ height: 'calc(100% - 20px)' }}>
        <EditorContent editor={editor} className="text-gray-900" />
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

export default NoteCard; 