import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`sortable-item ${isDragging ? 'dragging' : ''}`}>
      <div 
        {...attributes} 
        {...listeners} 
        style={{
          position: 'absolute',
          left: '-24px',
          top: '5px',
          cursor: 'grab',
          color: '#cbd5e1',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className="drag-handle"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </div>
      {children}
    </div>
  );
}
