import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Move } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface UploadedImage {
  id: string;
  url: string;
  file: File;
}

interface DraggableImageProps {
  image: UploadedImage;
  index: number;
  onReplace: (index: number, event: React.MouseEvent) => void;
  onDelete: (index: number, event: React.MouseEvent) => void;
  isDragging: boolean;
}

const DraggableImage: React.FC<DraggableImageProps> = ({ 
  image, 
  index, 
  onReplace, 
  onDelete,
  isDragging
}) => {
  return (
    <Card 
      className={`aspect-square relative flex items-center justify-center ${isDragging ? 'opacity-50 border-2 border-violet-500' : ''}`}
      data-id={image.id}
    >
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
            onClick={(e) => onReplace(index, e)}
          >
            <Edit className="h-3 w-3 text-[#8B5CF6]" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/20 hover:bg-white/30 rounded-full h-6 w-6"
            onClick={(e) => onDelete(index, e)}
          >
            <Trash2 className="h-3 w-3 text-[#8B5CF6]" />
          </Button>
        </div>
        <div className="absolute top-1 left-1">
          <div className="bg-white/20 hover:bg-white/30 rounded-full h-6 w-6 flex items-center justify-center cursor-move">
            <Move className="h-3 w-3 text-[#8B5CF6]" />
          </div>
        </div>
      </div>
    </Card>
  );
};

const ImageUploadGrid = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
        toast.success('Image replaced successfully');
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
      if (newImages.length > 0) {
        toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded. Drag to reorder.`);
      }
    }
    
    if (event.target) {
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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
      
      toast.success('Image order updated');
    }
    
    setActiveId(null);
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
  
  const getCardSize = () => {
    if (isMobile) {
      return cols === 1 ? 'w-full' : cols === 2 ? 'w-36' : 'w-24';
    } else {
      return cols === 1 ? 'w-full' : cols === 2 ? 'w-48' : 'w-48';
    }
  };

  return (
    <div className="mb-4 flex justify-center">
      <div className="w-full max-w-md">
        <h3 className={`font-semibold text-black mb-2 ${isMobile ? 'text-base' : 'text-lg'}`} style={{ fontFamily: 'Sometype Mono, monospace' }}>
          Upload your 1-9 pictures {images.length > 0 && '(drag to reorder)'}
        </h3>
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div 
            className="grid gap-1 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              width: isMobile ? 
                (cols === 1 ? '100%' : cols === 2 ? '90%' : '100%') : 
                (cols === 1 ? '300px' : cols === 2 ? '400px' : '600px')
            }}
          >
            {images.map((image, index) => (
              <DraggableImage
                key={image.id}
                image={image}
                index={index}
                onReplace={handleReplaceImage}
                onDelete={handleDeleteImage}
                isDragging={activeId === image.id}
              />
            ))}
            
            {images.length < 9 && (
              <Card 
                className={`aspect-square relative flex items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors ${getCardSize()} bg-white/5`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-5 h-5 text-violet-500" />
              </Card>
            )}
            
            {[...Array(Math.max(0, slots - images.length - (images.length < 9 ? 1 : 0)))].map((_, index) => (
              <Card 
                key={`empty-${index}`}
                className={`aspect-square relative flex items-center justify-center ${getCardSize()} bg-white/5 opacity-50`}
              />
            ))}
          </div>
        </DndContext>
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
