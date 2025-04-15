
import React, { useState, useRef } from 'react';
import { Plus, Edit } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface UploadedImage {
  url: string;
  file: File;
}

const ImageUploadGrid = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 9) {
      alert('You can only upload up to 9 images');
      return;
    }
    
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    
    setImages([...images, ...newImages]);
  };

  const handleReplaceImage = (indexToReplace: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      // We'll use a separate state or ref to track which image is being replaced
      fileInputRef.current.onchange = (event: any) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
          const newImages = [...images];
          newImages[indexToReplace] = {
            url: URL.createObjectURL(files[0]),
            file: files[0]
          };
          setImages(newImages);
        }
      };
    }
  };

  const getGridConfig = () => {
    const totalSlots = images.length <= 1 ? 1 : 
                      images.length <= 4 ? 4 : 9;
    
    return {
      cols: images.length <= 1 ? 1 : 
            images.length <= 4 ? 2 : 3,
      slots: totalSlots
    };
  };

  const { cols, slots } = getGridConfig();

  return (
    <div className="mb-4 flex justify-center">
      <div>
        <h3 className="text-sm text-white/70 mb-2">Upload your 1-9 pictures</h3>
        <div 
          className={`grid gap-1 w-fit`}
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: cols === 1 ? '300px' : cols === 2 ? '400px' : '600px'
          }}
        >
          {[...Array(slots)].map((_, index) => {
            const image = images[index];
            
            if (index >= images.length && images.length >= 9) {
              return null;
            }

            return (
              <Card 
                key={index}
                className={`aspect-square relative flex items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors ${
                  cols === 1 ? 'w-full' : cols === 2 ? 'w-48' : 'w-48'
                } ${!image ? 'bg-white/5' : ''}`}
                onClick={() => !image && fileInputRef.current?.click()}
              >
                {image ? (
                  <div className="w-full h-full relative">
                    <img 
                      src={image.url} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/30 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplaceImage(index);
                      }}
                    >
                      <Edit className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                ) : (
                  <Plus className="w-6 h-6 text-accent" />
                )}
              </Card>
            );
          })}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default ImageUploadGrid;
