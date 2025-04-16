
import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface UploadedImage {
  id: string;
  url: string;
  file: File;
}

const ImageUploadGrid = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + images.length > 9) {
      toast.error('You can only upload up to 9 images', {
        description: 'Please select fewer images.'
      });
      return;
    }
    
    if (editingIndex !== null) {
      if (files.length === 1) {
        const newImageArray = [...images];
        newImageArray[editingIndex] = {
          id: crypto.randomUUID(),
          url: URL.createObjectURL(files[0]),
          file: files[0]
        };
        setImages(newImageArray);
        setEditingIndex(null);
      } else {
        const newImages = files.map(file => ({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          file
        }));
        setImages(newImages);
        setEditingIndex(null);
      }
    } else {
      const newImages = files.map(file => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file
      }));
      setImages([...images, ...newImages]);
    }
    
    // Clear the input value so the same file can be selected again
    if (event.target.value) {
      event.target.value = '';
    }
  };

  const handleReplaceImage = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    toast.success('Image deleted successfully');
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
  
  // Determine optimal image card size for mobile
  const getCardSize = () => {
    if (isMobile) {
      return cols === 1 ? 'w-full' : cols === 2 ? 'w-36' : 'w-24';
    } else {
      return cols === 1 ? 'w-full' : cols === 2 ? 'w-48' : 'w-48';
    }
  };

  // Calculate the number of slots to display based on current image count
  const slotsToShow = images.length === 0 ? 1 : Math.min(Math.max(slots, images.length + 1), 9);

  return (
    <div className="mb-4 flex justify-center">
      <div className="w-full max-w-md">
        <h3 className={`font-semibold text-black mb-2 ${isMobile ? 'text-base' : 'text-lg'}`} style={{ fontFamily: 'Sometype Mono, monospace' }}>
          Upload your 1-9 pictures
        </h3>
        <div 
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: isMobile ? 
              (cols === 1 ? '100%' : cols === 2 ? '90%' : '100%') : 
              (cols === 1 ? '300px' : cols === 2 ? '400px' : '600px')
          }}
        >
          {[...Array(slotsToShow)].map((_, index) => {
            const image = images[index];
            
            // Don't show more than 9 slots total
            if (index >= 9) {
              return null;
            }

            return image ? (
              <Card key={image.id} className="aspect-square relative flex items-center justify-center">
                <div className="w-full h-full relative">
                  <img 
                    src={image.url} 
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-white/20 hover:bg-white/30 rounded-full h-6 w-6"
                      onClick={(e) => handleReplaceImage(index, e)}
                    >
                      <Edit className="h-3 w-3 text-[#8B5CF6]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-white/20 hover:bg-white/30 rounded-full h-6 w-6"
                      onClick={(e) => handleDeleteImage(index, e)}
                    >
                      <Trash2 className="h-3 w-3 text-[#8B5CF6]" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card 
                key={index}
                className={`aspect-square relative flex items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors ${getCardSize()} bg-white/5`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-5 h-5 text-violet-500" />
                {images.length === 0 && index === 0 && (
                  <span className="text-xs text-muted-foreground absolute bottom-1">Add image</span>
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
