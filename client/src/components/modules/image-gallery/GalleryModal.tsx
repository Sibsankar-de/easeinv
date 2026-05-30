"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import {
  Search,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  CloudUpload,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearGalleryList,
  fetchGalleryImagesThunk,
  selectGalleryState,
  uploadGalleryImageThunk,
} from "@/store/features/gallerySlice";
import { GalleryItem } from "./GalleryItem";
import { toast } from "react-toastify";
import { pageLimits } from "@/constants/pageLimits";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { cn } from "@/components/utils";
import { Loader } from "@/components/ui/loader";
import { Tooltip } from "react-tooltip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (images: any[]) => void;
  selectedImageIds?: string[];
  multiSelect?: boolean;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedImageIds = [],
  multiSelect = true,
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: {
      galleryListData: { pages },
    },
    status,
    uploadStatus,
  } = useSelector(selectGalleryState);
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedIds, setLocalSelectedIds] =
    useState<string[]>(selectedImageIds);

  // Aggregate all images from loaded pages
  const allImages = Object.values(pages).flatMap((p: any) => p.docs);

  useEffect(() => {
    if (open) {
      setLocalSelectedIds(selectedImageIds);
      // Only fetch if page 1 doesn't exist
      if (!pages[1]) {
        dispatch(
          fetchGalleryImagesThunk({
            storeId,
            query: searchQuery,
            page: 1,
            limit: pageLimits.GALLERY_IMAGE,
          }),
        );
      }
    }
  }, [open, storeId, dispatch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch(clearGalleryList());
    dispatch(
      fetchGalleryImagesThunk({
        storeId,
        query,
        page: 1,
        limit: pageLimits.GALLERY_IMAGE,
      }),
    );
  };

  const handleImageSelect = (id: string) => {
    if (multiSelect) {
      setLocalSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } else {
      setLocalSelectedIds([id]);
    }
  };

  const handleConfirmSelection = () => {
    // Collect selected images from across all loaded pages
    const selectedImages = allImages.filter((img) =>
      localSelectedIds.includes(img._id),
    );
    onSelect(selectedImages);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB");
      return;
    }

    dispatch(uploadGalleryImageThunk({ storeId, file }))
      .unwrap()
      .then((newImage: any) => {
        toast.success("Image uploaded");
        if (multiSelect) {
          setLocalSelectedIds((prev) => [...prev, newImage._id]);
        } else {
          setLocalSelectedIds([newImage._id]);
        }
      });
  };

  const isUploading = uploadStatus === "loading";

  return (
    <Modal
      openState={open}
      onClose={onClose}
      className="max-w-4xl w-full h-[80vh] flex flex-col p-0"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon size={20} />
          Image Gallery
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="relative max-w-md p-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search images by name..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => handleSearch(e)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
            <ImageUploadButton
              isUploading={isUploading}
              onChange={handleFileUpload}
            />

            {allImages.map((image) => (
              <GalleryItem
                key={image._id}
                image={image}
                isSelected={localSelectedIds.includes(image._id)}
                onSelect={handleImageSelect}
              />
            ))}
          </div>

          <Pagination currentPage={1} totalPage={5} />

          {status === "loading" && allImages.length === 0 && (
            <div className="h-40 flex items-center justify-center">
              <Loader size={32} />
            </div>
          )}

          {status === "success" && allImages.length === 0 && searchQuery && (
            <EmptyState
              title="No images found"
              description="Upload images to select a image."
              icon={<ImageIcon size={48} />}
            />
          )}
        </div>
      </div>

      <div className="p-4 border-t flex items-center justify-between bg-gray-50">
        <p className="text-sm text-gray-600">
          {localSelectedIds.length} image(s) selected
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={localSelectedIds.length === 0}
            onClick={handleConfirmSelection}
          >
            Confirm Selection
          </Button>
        </div>
      </div>

      <Tooltip delayShow={1000} place="bottom" id="gallery-image-tooltip" />
    </Modal>
  );
};

const ImageUploadButton = ({
  isUploading,
  onChange,
}: {
  isUploading: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <label
      htmlFor="gallery-modal-upload"
      className={cn(
        "bg-gray-100 relative aspect-square text-gray-600! cursor-pointer group",
        "flex items-center justify-center overflow-hidden",
        "rounded-lg border-2 border-dashed border-gray-300",
        "hover:border-primary active:bg-gray-200 transition-all duration-200",
      )}
    >
      <input
        type="file"
        id="gallery-modal-upload"
        className="hidden"
        accept="image/*"
        onChange={onChange}
        disabled={isUploading}
      />
      <div className="flex flex-col items-center gap-1">
        <CloudUpload size={35} className="group-hover:text-primary" />
        <div>
          <p className="text-sm">Upload new</p>
          <p className="text-xs text-gray-500">Max size: 4MB</p>
        </div>
      </div>
      {isUploading && (
        <div
          className={cn(
            "absolute w-full h-full top-0 left-0",
            "bg-black/40 backdrop-blur-[2px]",
            "flex items-center justify-center",
          )}
        >
          <Loader stroke={5} size={30} />
        </div>
      )}
    </label>
  );
};
