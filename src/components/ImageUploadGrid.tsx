
import React, { useState, useRef } from 'react';
import { Plus, Edit, GripVertical } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UploadedImage {
  id: string;
  url: string;
  file: File;
}

const SortableImage = ({ image, index, onReplace }: { 
  image: UploadedImage; 
  index: number;
  onReplace: (index: number, event: React.MouseEvent) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="aspect-square relative flex items-center justify-center">
        <div className="w-full h-full relative">
          <img 
            src={image.url} 
            alt={`Upload ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/20 hover:bg-white/30 rounded-full cursor-grab"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-[#8B5CF6]" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/20 hover:bg-white/30 rounded-full"
              onClick={(e) => onReplace(index, e)}
            >
              <Edit className="h-5 w-5 text-[#8B5CF6]" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ImageUploadGrid = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
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
  };

  const handleReplaceImage = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
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
        <h3 className="text-sm text-black mb-2" style={{ fontFamily: 'Sometype Mono, monospace' }}>Upload your 1-9 pictures</h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div 
            className={`grid gap-1 w-fit`}
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              width: cols === 1 ? '300px' : cols === 2 ? '400px' : '600px'
            }}
          >
            <SortableContext 
              items={images.map(img => img.id)}
              strategy={horizontalListSortingStrategy}
            >
              {[...Array(slots)].map((_, index) => {
                const image = images[index];
                
                if (index >= images.length && images.length >= 9) {
                  return null;
                }

                return image ? (
                  <SortableImage
                    key={image.id}
                    image={image}
                    index={index}
                    onReplace={handleReplaceImage}
                  />
                ) : (
                  <Card 
                    key={index}
                    className={`aspect-square relative flex items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors ${
                      cols === 1 ? 'w-full' : cols === 2 ? 'w-48' : 'w-48'
                    } bg-white/5`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="w-6 h-6 text-violet-500" />
                  </Card>
                );
              })}
            </SortableContext>
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
