import React, { useState } from "react";
import { GalleryModal } from "../image-gallery/GalleryModal";
import Image from "next/image";
import { ImagePlus, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GalleryImageDto } from "@/types/dto/galleryImageDto";
import { cn } from "@/components/utils";

type ProductImageSectionTypes = {
  selectedImages: GalleryImageDto[];
  onImageChange: (images: GalleryImageDto[]) => void;
};

export const ProductImageSection = ({
  selectedImages,
  onImageChange,
}: ProductImageSectionTypes) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleImageSelect = (images: any[]) => {
    onImageChange(images);
  };

  const removeImage = (id: string) => {
    const updatedImages = selectedImages.filter((img) => img._id !== id);
    onImageChange(updatedImages);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {selectedImages.map((image) => (
          <ProductImage key={image._id} image={image} onRemove={removeImage} />
        ))}
        <Button
          variant="none"
          onClick={() => setIsGalleryOpen(true)}
          className={cn(
            "w-30 h-30 flex flex-col items-center justify-center text-gray-500!",
            "rounded-lg border-2 border-dashed border-border bg-background text-foreground",
          )}
        >
          <ImagePlus size={30} />
          <span className="text-xs mt-1">Add Images</span>
        </Button>
      </div>
      <GalleryModal
        open={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleImageSelect}
        selectedImageIds={selectedImages.map((img) => img._id)}
      />
    </div>
  );
};

const ProductImage = ({
  image,
  onRemove,
}: {
  image: GalleryImageDto;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="relative w-30 h-30 rounded-lg overflow-hidden border group">
      <Image src={image.url} alt={image.name} fill className="object-cover" />
      <Button
        variant="danger"
        onClick={() => onRemove(image._id)}
        className="absolute top-1 right-1 p-2"
      >
        <Trash size={12} />
      </Button>
    </div>
  );
};
