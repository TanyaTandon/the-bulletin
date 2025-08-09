import React, { useState, useRef } from "react";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "./ui/separator";

export interface UploadedImage {
  id: string;
  url: string;
  file: File;
}

const ImageUploadGrid: React.FC<{
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  imageMax: number;
}> = ({ images, setImages, imageMax }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length + images.length > imageMax) {
      toast.error(`You can only upload up to ${imageMax} images`, {
        description: "Please select fewer images.",
      });
      return;
    }

    if (editingIndex !== null) {
      if (files.length === 1) {
        const newImageArray = [...images];
        newImageArray[editingIndex] = {
          id: crypto.randomUUID(),
          url: URL.createObjectURL(files[0]),
          file: files[0],
        };
        setImages(newImageArray);
        setEditingIndex(null);
      } else {
        const newImages = files.map((file) => ({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          file,
        }));
        setImages(newImages);
        setEditingIndex(null);
      }
    } else {
      const newImages = files.map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
      }));
      setImages([...images, ...newImages]);
    }

    if (event.target.value) {
      event.target.value = "";
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
    toast.success("Image deleted successfully");
  };

  const handleAddMoreImages = () => {
    setEditingIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Start with 1x1, expand to 2x2, but keep same container size
  const gridCols = images.length === 0 ? 1 : 2;
  const totalSlots = images.length === 0 ? 1 : imageMax;

  // Fixed container dimensions - always the same size
  // The 2x2 grid fits in the same space as the 1x1 by making items smaller
  const containerWidth = isMobile ? "90%" : "300px";

  return (
    <div className="mb-4 flex justify-center flex-col items-center">
      <div className="w-full max-w-[40rem]">
        <div
          className="grid gap-1 mx-auto bg-[#fcffef]"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            width: containerWidth,
          }}
        >
          {[...Array(totalSlots)].map((_, index) => {
            const image = images[index];

            return image ? (
              <Card
                key={image.id}
                className="aspect-square relative flex items-center justify-center group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="w-full h-full relative">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Always visible controls for multi-image view */}
                  {images.length > 1 && (
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
                  )}

                  {/* Single image hover overlay */}
                  {images.length === 1 && (
                    <>
                      {/* Hover overlay for adding more images */}
                      <div
                        className={`absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-opacity duration-200 ${
                          hoveredIndex === index ? "opacity-100" : "opacity-0"
                        }`}
                        onClick={handleAddMoreImages}
                      >
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Plus className="w-6 h-6" />
                          <span className="text-xs">Add more images</span>
                        </div>
                      </div>

                      {/* Always visible controls for single image */}
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
                    </>
                  )}
                </div>
              </Card>
            ) : (
              <Card
                key={index}
                className="aspect-square relative flex items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors bg-white/5"
                onClick={handleAddMoreImages}
              >
                <Plus className="w-5 h-5 text-violet-500" />
                {images.length === 0 && index === 0 && (
                  <span className="text-xs text-muted-foreground absolute bottom-1">
                    Add up to {imageMax} images
                  </span>
                )}
              </Card>
            );
          })}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          multiple={editingIndex === null}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default ImageUploadGrid;
