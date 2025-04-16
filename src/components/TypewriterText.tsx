
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TypewriterTextProps {
  text: string;
  speed?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 25 }) => {
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

  return (
    <div 
      className={`text-black mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}
      style={{ fontFamily: 'Sometype Mono, monospace' }}
    >
      {displayedText}
      {currentIndex < text.length && <span className="animate-pulse text-black">|</span>}
    </div>
  );
};

export default TypewriterText;
