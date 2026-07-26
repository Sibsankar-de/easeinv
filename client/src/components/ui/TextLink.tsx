import React from "react";
import Link from "next/link";
import { cn } from "../utils";

export interface TextLinkProps extends React.ComponentPropsWithoutRef<
  typeof Link
> {
  className?: string;
  children: React.ReactNode;
}

export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(
          "text-sm font-medium text-indigo-600 hover:text-indigo-700",
          "transition-colors cursor-pointer select-none",
          className,
        )}
        {...props}
      >
        {children}
      </Link>
    );
  },
);
