import React, { useState, useEffect, useRef } from 'react';

const TypingEffect = ({ text, speed = 50, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  const textRef = useRef(text);

  // Reset when text prop changes
  useEffect(() => {
    if (!text) return;
    setDisplayedText('');
    indexRef.current = 0;
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (!text || indexRef.current >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + text.charAt(indexRef.current));
      indexRef.current += 1;
    }, speed);

    return () => clearTimeout(timer);
  }, [text, speed]); // Removed index — now tracked via ref to avoid per-frame effect restart

  return <span className={className}>{displayedText}</span>;
};

export default TypingEffect;
