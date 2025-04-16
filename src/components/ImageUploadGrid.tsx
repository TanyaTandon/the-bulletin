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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (editingIndex !== null) {
      // Single image edit mode
      if (files.length === 1) {
        // Replace single image
        const newImageArray = [...images];
        newImageArray[editingIndex] = {
          url: URL.createObjectURL(files[0]),
          file: files[0]
        };
        setImages(newImageArray);
        setEditingIndex(null);
      } else {
        // Multiple images selected while editing - add all to appropriate grid
        const totalNewImages = files.length;
        const newImages = files.map(file => ({
          url: URL.createObjectURL(file),
          file
        }));
        
        if (totalNewImages > 9) {
          alert('You can only upload up to 9 images');
          return;
        }
        
        setImages(newImages);
        setEditingIndex(null);
      }
    } else {
      // Adding new images
      if (files.length + images.length > 9) {
        alert('You can only upload up to 9 images');
        return;
      }
      
      const newImages = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      
      setImages([...images, ...newImages]);
    }
  };

  const handleReplaceImage = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getGridConfig = () => {
    const totalImages = images.length;
    
    if (totalImages <= 1) {
      return {
        cols: 1,
        slots: 1
      };
    } else if (totalImages <= 4) {
      return {
        cols: 2,
        slots: 4
      };
    } else {
      return {
        cols: 3,
        slots: 9
      };
    }
  };

  const { cols, slots } = getGridConfig();

  return (
    <div className="mb-4 flex justify-center">
      <div>
        <h3 className="text-sm text-black mb-2" style={{ fontFamily: 'Sometype Mono, monospace' }}>Upload your 1-4 pictures</h3>
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
                      onClick={(e) => handleReplaceImage(index, e)}
                    >
                      <Edit className="h-5 w-5 text-[#8B5CF6]" />
                    </Button>
                  </div>
                ) : (
                  <Plus className="w-6 h-6 text-violet-500" />
                )}
              </Card>
            );
          })}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={editingIndex === null}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default ImageUploadGrid;
