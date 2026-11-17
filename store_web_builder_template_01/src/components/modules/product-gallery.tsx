"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [primaryApi, setPrimaryApi] = React.useState<CarouselApi>();
  const [modalApi, setModalApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [modalIndex, setModalIndex] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Sync primary carousel slide with selectedIndex
  React.useEffect(() => {
    if (!primaryApi) return;
    const onSelect = () => {
      setSelectedIndex(primaryApi.selectedScrollSnap());
    };
    primaryApi.on("select", onSelect);
    primaryApi.on("reInit", onSelect);
    return () => {
      primaryApi.off("select", onSelect);
    };
  }, [primaryApi]);

  // Sync modal carousel slide with modalIndex
  React.useEffect(() => {
    if (!modalApi) return;
    const onSelect = () => {
      setModalIndex(modalApi.selectedScrollSnap());
    };
    modalApi.on("select", onSelect);
    modalApi.on("reInit", onSelect);
    return () => {
      modalApi.off("select", onSelect);
    };
  }, [modalApi]);

  // When modal opens, sync modalApi position with modalIndex
  React.useEffect(() => {
    if (!isModalOpen || !modalApi) return;
    const timer = setTimeout(() => {
      modalApi.reInit();
      modalApi.scrollTo(modalIndex, true);
    }, 50);
    return () => clearTimeout(timer);
  }, [isModalOpen, modalApi, modalIndex]);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    primaryApi?.scrollTo(index);
  };

  const handleOpenModal = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Product Carousel (shadcn Carousel) */}
      <Carousel
        setApi={setPrimaryApi}
        opts={{ loop: true }}
        className="group relative w-full"
      >
        <CarouselContent className="-ml-0">
          {images.map((img, index) => (
            <CarouselItem key={img.id} className="pl-0">
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleOpenModal(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenModal(index);
                  }
                }}
                className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/70 bg-muted/20 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Enlarge image ${index + 1} of ${images.length}`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${title} - Image ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover Zoom Hint */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
                  <ZoomIn className="size-3.5" />
                  <span>Click to enlarge</span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-3 inset-y-0 my-auto size-9 bg-background/85 backdrop-blur shadow-md hover:bg-background border-border/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="right-3 inset-y-0 my-auto size-9 bg-background/85 backdrop-blur shadow-md hover:bg-background border-border/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </Carousel>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {images.map((img, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => handleThumbnailClick(index)}
                className={`relative size-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                  isSelected
                    ? "border-foreground ring-2 ring-foreground/20 scale-[0.98]"
                    : "border-border/70 opacity-70 hover:opacity-100"
                }`}
                aria-label={`Select image ${index + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${title} preview ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Screen-Sized Lightbox Modal (shadcn Dialog + Carousel) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          overlayClassName="bg-black/80 backdrop-blur-sm"
          className="w-[96vw] max-w-[96vw] sm:max-w-[96vw] md:max-w-[94vw] lg:max-w-[92vw] h-[94vh] max-h-[94vh] flex flex-col p-4 sm:p-6 bg-card/95 border-border/80 shadow-2xl rounded-2xl"
        >
          <DialogHeader className="shrink-0 flex flex-row items-center justify-between pb-2 pr-10">
            <DialogTitle className="text-sm sm:text-base font-semibold text-foreground truncate max-w-[70vw]">
              {title}
            </DialogTitle>
            {images.length > 1 && (
              <span className="text-xs font-mono text-muted-foreground shrink-0 bg-muted/60 px-2.5 py-1 rounded-full border border-border/60">
                {modalIndex + 1} / {images.length}
              </span>
            )}
          </DialogHeader>

          {/* Modal Main Image Viewport powered by shadcn Carousel */}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-xl bg-muted/20 my-1 sm:my-2">
            <Carousel
              setApi={setModalApi}
              opts={{ loop: true }}
              className="h-full w-full"
            >
              <CarouselContent containerClassName="h-full" className="-ml-0 h-full">
                {images.map((img, index) => (
                  <CarouselItem key={img.id} className="pl-0 h-full">
                    <div className="relative h-full w-full p-2 sm:p-4 flex items-center justify-center">
                      <Image
                        src={img.url}
                        alt={img.altText ?? `${title} enlarged view ${index + 1}`}
                        fill
                        priority={index === modalIndex}
                        sizes="(max-width: 1200px) 96vw, 1800px"
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-3 sm:left-4 inset-y-0 my-auto size-10 sm:size-11 rounded-full bg-background/85 backdrop-blur shadow-md hover:bg-background border-border/80 transition-all hover:scale-105" />
                  <CarouselNext className="right-3 sm:right-4 inset-y-0 my-auto size-10 sm:size-11 rounded-full bg-background/85 backdrop-blur shadow-md hover:bg-background border-border/80 transition-all hover:scale-105" />
                </>
              )}
            </Carousel>
          </div>

          {/* Modal Thumbnails Row */}
          {images.length > 1 && (
            <div className="shrink-0 flex items-center justify-center gap-2 pt-1 sm:pt-2 overflow-x-auto max-w-full">
              {images.map((img, index) => {
                const isSelected = index === modalIndex;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => modalApi?.scrollTo(index)}
                    className={`relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                      isSelected
                        ? "border-foreground ring-2 ring-foreground/30 scale-95 shadow-sm"
                        : "border-border/60 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? `Thumbnail ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
