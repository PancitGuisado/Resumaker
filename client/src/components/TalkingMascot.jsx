import React, { useState, useEffect } from 'react';

export default function TalkingMascot({ text, onTypingComplete, children }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect & mouth animation loop
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    
    // Typewriter interval
    const typeTimer = setInterval(() => {
      setDisplayedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(typeTimer);
        setIsTyping(false);
        setIsOpen(false);
        if (onTypingComplete) onTypingComplete();
      }
    }, 40); // speed of typing

    // Mouth animation interval
    const mouthTimer = setInterval(() => {
      if (index < text.length) {
        setIsOpen(prev => !prev);
      }
    }, 150); // speed of mouth flap

    return () => {
      clearInterval(typeTimer);
      clearInterval(mouthTimer);
    };
  }, [text]);

  return (
    <div className="game-dialogue-wrapper">
      <div className="game-mascot-avatar">
        <img 
          src={isOpen ? "/cat-open.jpg" : "/cat-close.png"} 
          alt="Mascot" 
        />
      </div>
      <div className="game-dialogue-box">
        <div className="game-name-tag">Katiting</div>
        <div className="game-dialogue-text">
          {displayedText}
          {isTyping && <span className="typing-cursor">|</span>}
        </div>
        <div className="game-dialogue-content">
          {children}
        </div>
      </div>
    </div>
  );
}
