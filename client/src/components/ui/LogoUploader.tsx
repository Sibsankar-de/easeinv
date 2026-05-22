"use client";

import { ImagePlus, LucideProps, Upload } from "lucide-react";
import React, { useId } from "react";
import { cn } from "../utils";
import { Loader } from "./loader";

interface LogoUploaderProps {
  id?: string;
  fallbackIcon?: React.FC<LucideProps>;
  buttonText?: string;
  imagePreviewUrl?: string;
  isUploading?: boolean;
  onFileSelect?: (file: File | undefined) => void;
}

export const LogoUploader = ({
  id,
  fallbackIcon: FallbackIcon,
  buttonText = "Upload Logo",
  imagePreviewUrl,
  isUploading = false,
  onFileSelect,
}: LogoUploaderProps) => {
  id = id || useId();
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "w-24 h-24 bg-gray-100 relative",
          "flex items-center justify-center overflow-hidden",
          "rounded-lg border-2 border-dashed border-gray-300",
        )}
      >
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="logo" className="w-full h-full" />
        ) : FallbackIcon ? (
          <FallbackIcon className="w-8 h-8 text-gray-400" />
        ) : (
          <ImagePlus className="w-8 h-8 text-gray-400" />
        )}
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
      </div>
      <div className="flex-1">
        <label
          htmlFor={id}
          className={cn(
            "w-fit h-fit",
            "flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer select-none",
            "border border-border bg-background text-foreground",
            "hover:bg-accent/50 hover:text-accent-foreground",
            "transition-all duration-150 active:translate-y-0.5 active:brightness-90",
            isUploading && "pointer-events-none opacity-50",
          )}
        >
          <Upload className="w-4 h-4" />
          {isUploading ? "Uploading..." : buttonText}
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Recommended size: 200x200px. Max file size: 2MB
        </p>
      </div>
      <input
        type="file"
        name="logo-uploader"
        id={id}
        className="hidden"
        multiple={false}
        accept="image/*"
        disabled={isUploading}
        onChange={(e) => onFileSelect?.(e.target.files?.[0])}
      />
    </div>
  );
};
