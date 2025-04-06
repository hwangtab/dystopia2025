import React, { useState, useEffect } from 'react';

const TypingEffect = ({ text, speed = 50, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!text) return; // text가 없으면 실행 중지

    setDisplayedText(''); // Reset text when the input text changes
    setIndex(0); // Reset index when the input text changes

    const timer = setTimeout(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }
    }, speed);

    // Cleanup function to clear timeout if component unmounts or text changes
    return () => clearTimeout(timer);

  }, [index, text, speed]); // Rerun effect when index, text, or speed changes

  // Return only the displayed text without the cursor effect
  return (
    <span className={className}>
      {displayedText}
      {/* Removed style tag with cursor effect */}
    </span>
  );
};

export default TypingEffect;
