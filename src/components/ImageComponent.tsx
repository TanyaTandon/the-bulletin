
import React from 'react';

interface ImageComponentProps {
  src: string;
  alt?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  onClick?: () => void;
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  src,
  alt = "image",
  className,
  width,
  height,
  onClick
}) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={{ width, height }}
      onClick={onClick}
    />
  );
};

export default ImageComponent;
