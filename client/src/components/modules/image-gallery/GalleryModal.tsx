"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Modal, ModalHeader } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { X, Image as ImageIcon, CloudUpload } from "lucide-react";
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
import { GalleryImageDto } from "@/types/dto/galleryImageDto";
import { SearchInput } from "@/components/ui/SearchInput";
import { getTableSearchDebounceTime } from "@/utils/get-debounce";
import { Skeleton } from "@/components/ui/Skeleton";

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (images: GalleryImageDto[]) => void;
  selectedImageIds?: string[];
  multiSelect?: boolean;
  selectedImages?: { imageId: string; url: string; name: string }[];
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedImageIds = [],
  multiSelect = true,
  selectedImages = [],
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { galleryListData },
    status,
    uploadStatus,
  } = useSelector(selectGalleryState);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceCtx = React.useRef({ lastInputAt: 0, lastValueLength: 0 });
  const [localSelectedImages, setLocalSelectedImages] = useState<
    GalleryImageDto[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);

  // Initialize/reset selections when modal opens/closes
  useEffect(() => {
    if (open) {
      if (selectedImages) {
        const initialSelected = selectedImages.map(
          (img) =>
            ({
              id: img.imageId,
              url: img.url,
              name: img.name,
            }) as GalleryImageDto,
        );
        setLocalSelectedImages(initialSelected);
      } else {
        setLocalSelectedImages([]);
      }
    }
  }, [open, selectedImages]);

  // Clean up search state on modal close
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setDebouncedSearchTerm("");
      dispatch(clearGalleryList());
    }
  }, [open, dispatch]);

  // Debounce search input
  useEffect(() => {
    const delay = getTableSearchDebounceTime(searchTerm, debounceCtx.current);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
      dispatch(clearGalleryList());
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  // Fetch gallery images
  useEffect(() => {
    if (!open) {
      return;
    }

    if (!galleryListData.pages[currentPage]) {
      dispatch(
        fetchGalleryImagesThunk({
          storeId,
          query: debouncedSearchTerm || undefined,
          page: currentPage,
          limit: pageLimits.GALLERY_IMAGE,
        }),
      );
    }
  }, [
    open,
    storeId,
    currentPage,
    galleryListData,
    debouncedSearchTerm,
    dispatch,
  ]);

  const handleImageSelect = (image: GalleryImageDto) => {
    if (multiSelect) {
      setLocalSelectedImages((prev) =>
        prev.find((img) => img.id === image.id)
          ? prev.filter((img) => img.id !== image.id)
          : [...prev, image],
      );
    } else {
      setLocalSelectedImages([image]);
    }
  };

  const handleConfirmSelection = () => {
    onSelect(localSelectedImages);
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
        handleImageSelect(newImage);
      });
  };

  const pageData = useMemo(
    () => galleryListData.pages[currentPage]?.docs || [],
    [galleryListData, currentPage],
  );

  const isUploading = uploadStatus === "loading";

  return (
    <Modal
      openState={open}
      onClose={onClose}
      className="w-4xl h-[80vh] flex flex-col"
      header={<ModalHeader title="Image Gallery" />}
    >
      <div className="flex-1 overflow-hidden flex flex-col gap-4 p-2">
        <SearchInput
          placeholder="Search image by name..."
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
            <ImageUploadButton
              isUploading={isUploading}
              onChange={handleFileUpload}
            />

            {status === "loading" && pageData.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <GalleryItemSkeleton key={i} />
                ))
              : pageData.map((image) => (
                  <GalleryItem
                    key={image.id}
                    image={image}
                    isSelected={
                      localSelectedImages.find((img) => img.id === image.id)
                        ? true
                        : false
                    }
                    onSelect={handleImageSelect}
                  />
                ))}
          </div>

          {galleryListData.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPage={galleryListData.totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {status === "success" &&
            pageData.length === 0 &&
            debouncedSearchTerm && (
              <EmptyState
                title="No images found"
                description="Upload images to select a image."
                icon={<ImageIcon size={48} />}
              />
            )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {localSelectedImages.length} image(s) selected
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={localSelectedImages.length === 0}
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

const GalleryItemSkeleton = () => {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none animate-pulse bg-gray-200" />
      <div className="p-2 border-t border-border flex justify-center">
        <Skeleton className="h-3 w-16 animate-pulse bg-gray-200" />
      </div>
    </div>
  );
};
