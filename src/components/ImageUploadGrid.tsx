
import React from 'react';
import { Plus } from 'lucide-react';
import { Card } from './ui/card';

const ImageUploadGrid = () => {
  return (
    <div className="mb-6">
      <h3 className="text-sm text-muted-foreground mb-3">Upload your 1-9 pictures</h3>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, index) => (
          <Card 
            key={index}
            className="aspect-square relative flex items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors w-32"
          >
            <Plus className="w-6 h-6 text-muted-foreground" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageUploadGrid;
