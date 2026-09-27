import React from "react";
import { cn } from "../utils";

export interface CardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps
  extends Omit<React.ComponentProps<"div">, "title"> {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const CardHeader = ({
  title,
  icon,
  children,
  className,
  ...props
}: CardHeaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-gray-900 font-semibold border-b border-gray-100 pb-3",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {title ? <h2 className="text-base font-semibold">{title}</h2> : children}
    </div>
  );
};
