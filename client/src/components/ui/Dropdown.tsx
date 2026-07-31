"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { OverlayManager } from "@/utils/overlay-manager";

type DropDownProps = {
  children?: React.ReactNode;
  openState: boolean;
  className?: string;
  onClose?: () => void;
  style?: React.CSSProperties;
};

export const Dropdown = ({
  children,
  openState,
  onClose,
  className,
  style,
}: DropDownProps) => {
  const [mounted, setMounted] = useState(openState);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (openState) {
      setMounted(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      timerRef.current = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
      }, 300);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [openState]);

  useEffect(() => {
    if (mounted && !isClosing && onClose) {
      OverlayManager.push(onClose);
      return () => {
        OverlayManager.pop(onClose);
      };
    }
  }, [mounted, isClosing, onClose]);

  // close dropdown on outside click
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Small delay to ensure the button click is processed first
      setTimeout(() => {
        if (
          mounted &&
          !isClosing &&
          boxRef.current &&
          document.body.contains(target) &&
          !boxRef.current?.contains(target) &&
          onClose
        ) {
          onClose();
        }
      }, 250);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mounted, isClosing, onClose]);

  if (!mounted) return null;
  return (
    <div
      className={clsx(
        "bg-white rounded-lg p-1 text-sm w-[20em] absolute border border-secondary z-50",
        isClosing ? "dropdown-close-anim" : "dropdown-open-anim",
        className,
      )}
      style={style}
      ref={boxRef}
    >
      {children}
    </div>
  );
};
