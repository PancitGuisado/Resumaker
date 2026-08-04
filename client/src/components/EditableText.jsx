import React, { useState, useEffect, useRef } from 'react';

export default function EditableText({ value, onChange, className, placeholder = 'Empty', as = 'span' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  const handleKeyDown = (e) => {
    // If it's a single-line input like span/h1/h2, Enter saves it. 
    // If it's a block like p/div (multiline), allow Enter for newlines.
    if (e.key === 'Enter' && as !== 'p' && as !== 'div') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  if (isEditing) {
    if (as === 'p' || as === 'div') {
      return (
        <textarea
          ref={inputRef}
          className={`${className} editable-active`}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          style={{ width: '100%', minHeight: '3em', background: 'rgba(255,255,255,0.8)', color: '#000', border: '1px dashed #2563eb', padding: '2px', outline: 'none' }}
        />
      );
    }
    
    return (
      <input
        ref={inputRef}
        type="text"
        className={`${className} editable-active`}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{ width: '100%', background: 'rgba(255,255,255,0.8)', color: '#000', border: '1px dashed #2563eb', padding: '2px', outline: 'none', font: 'inherit' }}
      />
    );
  }

  const Tag = as;
  return (
    <Tag 
      className={`${className} editable-text`} 
      onClick={() => setIsEditing(true)}
      style={{ cursor: 'pointer', transition: 'background 0.2s', ...(!currentValue ? { color: '#cbd5e1', fontStyle: 'italic' } : {}) }}
      title="Click to edit"
    >
      {currentValue || placeholder}
    </Tag>
  );
}
