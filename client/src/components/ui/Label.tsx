import React from "react";
import { cn } from "../utils";

export const Label = ({
  children,
  className,
  required = false,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
  props?: React.ComponentProps<"label">;
}) => {
  return (
    <label className={cn("block text-gray-600 mb-1.5", className)} {...props}>
      {children} {required && <span className="text-red-400">*</span>}
    </label>
  );
};
