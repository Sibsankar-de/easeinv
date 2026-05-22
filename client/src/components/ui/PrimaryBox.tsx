import React from "react";
import { cn } from "../utils";

export const PrimaryBox = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
