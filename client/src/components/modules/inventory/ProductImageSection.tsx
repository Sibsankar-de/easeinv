import { useState, useEffect, useRef } from "react";
import { GalleryModal } from "../image-gallery/GalleryModal";
import Image from "next/image";
import { ImagePlus, Trash, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/utils";
import { ProductImageType } from "@/types/dto/productDto";
import { GalleryImageDto } from "@/types/dto/galleryImageDto";
import { useDispatch, useSelector } from "react-redux";
import {
  rearrangeProductImagesThunk,
  selectProductState,
} from "@/store/features/productSlice";
import { Badge } from "@/components/ui/Badge";

type ProductImageSectionTypes = {
  selectedImages: ProductImageType[];
  onImageChange: (images: ProductImageType[]) => void;
  storeId?: string;
  productId?: string;
  rearrangeAllowed?: boolean;
};

export const ProductImageSection = ({
  selectedImages,
  onImageChange,
  storeId,
  productId,
  rearrangeAllowed,
}: ProductImageSectionTypes) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isLocalRearranging, setIsLocalRearranging] = useState(false);

  const dispatch = useDispatch();
  const { rearrangeStatus } = useSelector(selectProductState);

  const isRearrangeDisabled =
    isLocalRearranging || rearrangeStatus === "loading";

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleRearrange = (updatedImages: ProductImageType[]) => {
    onImageChange(updatedImages);

    if (!rearrangeAllowed || !productId || !storeId) {
      return;
    }

    setIsLocalRearranging(true);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const imagePriorities = updatedImages.reduce(
        (acc, img, index) => {
          acc[img.imageId] = index + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      dispatch(
        rearrangeProductImagesThunk({ storeId, productId, imagePriorities }),
      )
        .unwrap()
        .then((rearrangedList: ProductImageType[]) => {
          onImageChange(rearrangedList);
        })
        .finally(() => {
          setIsLocalRearranging(false);
        });
    }, 500);
  };

  const handleImageSelect = (images: GalleryImageDto[]) => {
    const productImages: ProductImageType[] = images.map((img, index) => ({
      ...(selectedImages.find((selected) => selected.imageId === img._id) || {
        _id: "",
        imageId: img._id,
        priority: index + 1,
        url: img.url,
        name: img.name,
      }),
    }));
    onImageChange(productImages);
  };

  const removeImage = (id: string) => {
    const updatedImages = selectedImages.filter((img) => img.imageId !== id);
    const prioritizedImages = updatedImages.map((img, idx) => ({
      ...img,
      priority: idx + 1,
    }));
    onImageChange(prioritizedImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isRearrangeDisabled) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === toIndex) {
      setDragOverIndex(null);
      setDraggedIndex(null);
      return;
    }

    const updatedImages = [...selectedImages];
    const [draggedItem] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(toIndex, 0, draggedItem);

    const prioritizedImages = updatedImages.map((img, idx) => ({
      ...img,
      priority: idx + 1,
    }));

    handleRearrange(prioritizedImages);

    setDragOverIndex(null);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const ImageAddButton = () => (
    <Button
      variant="none"
      onClick={() => setIsGalleryOpen(true)}
      disabled={isRearrangeDisabled}
      className={cn(
        "w-30 h-30 flex flex-col items-center justify-center text-gray-500!",
        "rounded-lg border-2 border-dashed border-border bg-background text-foreground",
        isRearrangeDisabled &&
          "opacity-50 cursor-not-allowed pointer-events-none",
      )}
    >
      <ImagePlus size={30} />
      <span className="text-xs mt-1">Add Images</span>
    </Button>
  );

  return (
    <div className="space-y-2">
      {selectedImages.length === 0 ? (
        <div className="flex">
          <ImageAddButton />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Main Thumbnail Image */}
          <div className="shrink-0">
            <ProductImage
              key={selectedImages[0].imageId}
              index={0}
              image={selectedImages[0]}
              onRemove={removeImage}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === 0}
              isDragOver={dragOverIndex === 0}
              disabled={isRearrangeDisabled}
              isThumbnail={true}
            />
          </div>

          {/* Secondary Images List */}
          <div className="flex flex-wrap gap-4 items-start grow">
            {selectedImages.slice(1).map((image, idx) => {
              const originalIndex = idx + 1;
              return (
                <ProductImage
                  key={image.imageId}
                  index={originalIndex}
                  image={image}
                  onRemove={removeImage}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedIndex === originalIndex}
                  isDragOver={dragOverIndex === originalIndex}
                  disabled={isRearrangeDisabled}
                  isThumbnail={false}
                />
              );
            })}
            <ImageAddButton />
          </div>
        </div>
      )}

      <GalleryModal
        open={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleImageSelect}
        selectedImageIds={selectedImages.map((img) => img.imageId)}
      />
    </div>
  );
};

const ProductImage = ({
  image,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
  disabled,
  isThumbnail,
}: {
  image: ProductImageType;
  index: number;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnter: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  disabled: boolean;
  isThumbnail: boolean;
}) => {
  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "relative rounded-lg overflow-hidden border transition-all duration-200 group select-none",
        isThumbnail ? "w-64 h-64 shadow-sm" : "w-30 h-30",
        !disabled && "cursor-grab active:cursor-grabbing",
        disabled && "cursor-not-allowed opacity-80",
        isDragging && "opacity-40 border-dashed border-primary scale-95",
        isDragOver && "border-primary border-2 scale-105 shadow-md",
      )}
    >
      <Image
        src={image.url}
        alt={image.name}
        fill
        className="object-cover pointer-events-none"
      />
      <div
        className={cn(
          "flex flex-row-reverse items-center gap-2",
          "absolute transition-all duration-200",
          isThumbnail ? "top-2 right-2" : "top-1 right-1",
          "opacity-0 group-hover:opacity-100 focus:opacity-100",
          disabled && "hidden",
        )}
      >
        <Button
          variant="danger"
          onClick={() => onRemove(image.imageId)}
          disabled={disabled}
          className="p-2"
        >
          <Trash size={12} />
        </Button>

        <Button
          variant="outline"
          disabled={disabled}
          className="p-2 cursor-grab"
        >
          <GripVertical size={12} />
        </Button>
      </div>

      {/* Thumbnail Pill */}
      {isThumbnail && (
        <Badge className="absolute top-2 left-2 z-10">Thumbnail</Badge>
      )}
    </div>
  );
};
