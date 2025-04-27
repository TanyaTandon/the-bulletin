
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 25, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  // Calculate the height needed for the full text (approximation)
  const lines = text.split('\n').length;
  const minHeight = `${Math.max(lines * 1.5, 6)}em`; // Minimum height based on line count

  return (
    <div 
      className={`text-black mb-2 ${isMobile ? 'text-lg' : 'text-xl'} ${className}`}
      style={{ 
        fontFamily: 'Sometype Mono, monospace',
        minHeight, 
        height: 'auto'
      }}
      dangerouslySetInnerHTML={{ __html: displayedText }}
    />
  );
};

export default TypewriterText;
