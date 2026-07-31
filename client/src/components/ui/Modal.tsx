"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils";
import { Button } from "./Button";
import { X } from "lucide-react";
import { OverlayManager } from "@/utils/overlay-manager";

const ModalContext = createContext<{
  open: boolean;
  onClose?: () => void;
}>({
  open: false,
  onClose: () => {},
});

export const useModalContext = () => useContext(ModalContext);

export type ModalProps = {
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
  openState?: boolean;
  header?: React.ReactNode;
};

export const Modal = ({
  children,
  openState = false,
  className = "",
  header,
  onClose,
}: ModalProps) => {
  const [mounted, setMounted] = useState(openState);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (openState) {
      setMounted(true);
      setClosing(false);
      document.body.style.overflowY = "hidden";
    } else {
      setClosing(true);
      timerRef.current = setTimeout(() => {
        setMounted(false);
        setClosing(false);
        document.body.style.overflowY = "auto";
      }, 300);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [openState]);

  useEffect(() => {
    if (mounted && !closing && onClose) {
      OverlayManager.push(onClose);
      return () => {
        OverlayManager.pop(onClose);
      };
    }
  }, [mounted, closing, onClose]);

  if (!mounted) return null;
  return createPortal(
    <ModalContext.Provider value={{ open: mounted && !closing, onClose }}>
      <div
        className={cn(
          "fixed top-0 left-0 z-60 w-screen h-screen pt-8 pb-2 overflow-y-auto",
          "bg-black/50 backdrop-blur-[5px]",
          "flex items-start justify-center",
          closing ? "fade-out" : "fade-in",
        )}
        onClick={() => onClose && onClose()}
      >
        <div
          className={cn(
            "bg-background rounded-xl",
            closing ? "dropdown-close-anim" : "dropdown-open-anim",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          {header && header}

          {/* Modal body */}
          <div className={cn("min-w-[15em] min-h-[5em] p-3", className)}>
            {children}
          </div>
        </div>
      </div>
    </ModalContext.Provider>,
    document.body,
  );
};

export const ModalHeader = ({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: string;
}) => {
  const { onClose } = useModalContext();
  return (
    <div className="p-3 flex items-baseline gap-2 justify-between border-b border-border">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
      </div>
      <Button
        variant="outline"
        className="p-2 border-transparent"
        onClick={() => onClose && onClose()}
      >
        <X size={18} />
      </Button>
    </div>
  );
};
