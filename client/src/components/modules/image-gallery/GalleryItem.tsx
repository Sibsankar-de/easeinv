import React from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/components/utils";
import { Checkbox } from "@/components/ui/Checkbox";
import { GalleryImageDto } from "@/types/dto/galleryImageDto";
import { Tooltip } from "react-tooltip";

interface GalleryItemProps {
  image: GalleryImageDto;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({
  image,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      className={cn(
        `group relative cursor-pointer rounded-md overflow-hidden border-2 transition-all`,
        isSelected
          ? "border-primary"
          : "border-transparent hover:border-border",
      )}
      onClick={() => onSelect(image._id)}
    >
      <div className="aspect-square relative">
        <Image
          src={image.url}
          alt={image.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Checkbox
          className={cn(
            "absolute top-1 right-1",
            !isSelected && "hidden group-hover:block",
          )}
          checked={isSelected}
          onChange={() => onSelect(image._id)}
        />
      </div>
      <div className="p-2 border-t border-border">
        <p
          className="text-xs line-clamp-1 text-gray-600 text-center"
          data-tooltip-id="gallery-image-tooltip"
          data-tooltip-content={image.name}
        >
          {image.name}
        </p>
      </div>
    </div>
  );
};
