"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { OverlayManager } from "@/utils/overlay-manager";

type DropDownProps = {
  children?: React.ReactNode;
  openState: boolean;
  className?: string;
  onClose?: () => void;
};

export const Dropdown = ({
  children,
  openState,
  onClose,
  className,
}: DropDownProps) => {
  // handle dropdown open state
  const [isOpen, setIsOpen] = useState(false);
  const [isClose, setIsClose] = useState(false);
  useEffect(() => {
    if (openState) {
      setTimeout(() => {
        setIsOpen(true);
      }, 0);
    } else {
      setTimeout(() => {
        setIsClose(true);
      }, 0);
      setTimeout(() => {
        setIsOpen(false);
        setIsClose(false);
      }, 250); // match the animation duration
    }
  }, [openState]);

  useEffect(() => {
    if (isOpen && onClose) {
      OverlayManager.push(onClose);
      return () => {
        OverlayManager.pop(onClose);
      };
    }
  }, [isOpen, onClose]);

  // close dropdown on outside click
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Small delay to ensure the button click is processed first
      setTimeout(() => {
        if (
          isOpen &&
          boxRef.current &&
          !boxRef.current?.contains(event.target as Node) &&
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      className={clsx(
        `bg-white rounded-lg p-1 text-sm w-[20em] absolute border border-secondary z-50 dropdown-open-anim`,
        className,
        isClose && "dropdown-close-anim",
      )}
      ref={boxRef}
    >
      {children}
    </div>
  );
};
