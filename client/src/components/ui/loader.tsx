import { useEffect, useState } from "react";
import { cn } from "../utils";

export const Loader = ({
  size = 20,
  className,
  stroke = 2,
}: {
  size?: number;
  className?: string;
  stroke?: number;
}) => {
  return (
    <div
      className={cn(
        "border-white/30 border-t-white rounded-full animate-spin",
        className,
      )}
      style={{ width: size, height: size, borderWidth: `${stroke}px` }}
    ></div>
  );
};

export function SliderLoader({
  isVisible,
  className = "",
}: {
  isVisible?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 1300);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  if (!visible) return;
  return (
    <div
      className={`w-full h-1 bg-gray-200 rounded-full overflow-hidden relative ${className}`}
    >
      <div
        className={`absolute h-full w-full bg-linear-to-r from-primary/30 via-primary/50 to-primary rounded-full transition-transform duration-1000 ${
          visible ? "animate-slide" : "opacity-0"
        }`}
        style={{
          animation: "slideLoader 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        }}
      />
      <style jsx>{`
        @keyframes slideLoader {
          0% {
            transform: translateX(-100%);
            width: 20%;
          }
          30% {
            transform: translateX(0%);
            width: 50%;
          }
          80% {
            transform: translateX(50%);
            width: 30%;
          }
          100% {
            transform: translateX(100%);
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
}
