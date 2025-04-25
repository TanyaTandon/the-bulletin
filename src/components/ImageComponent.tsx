
import React from "react";

interface ImageComponentProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  src,
  alt = "",
  className = "",
  width,
  height,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{ cursor: "pointer" }}
    />
  );
};

export default ImageComponent;
