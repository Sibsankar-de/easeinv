"use client";

import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ModalProps = {
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
  openState?: boolean;
};

export const Modal = ({
  children,
  openState = false,
  onClose,
  className = "",
}: ModalProps) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (openState) {
      setOpen(true);
      setClosing(false);
      document.body.style.overflowY = "hidden";
    } else {
      setClosing(true);
      setTimeout(() => {
        setOpen(false);
        setClosing(false);
        document.body.style.overflowY = "auto";
      }, 300);
    }
  }, [openState]);

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;
    // close modal on excape
    if (key === "Escape" && open) {
      e.preventDefault();
      onClose?.();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  if (!open) return null;
  return createPortal(
    <div
      className={clsx(
      `fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] 
      flex items-start justify-center z-60 backdrop-blur-[5px] fade-in pt-8 pb-2 overflow-y-auto`,
      closing && "fade-out",
      )}
      onClick={() => onClose && onClose()}
    >
      <div
        className={clsx(
          "min-w-[15em] min-h-[5em] bg-background p-3 rounded-xl dropdown-open-anim",
          className,
          closing && "dropdown-close-anim",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
