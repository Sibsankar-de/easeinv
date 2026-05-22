import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { ReactNode } from "react";

export const ChartCard = ({
  title,
  description,
  children,
  className,
  heightClassName = "h-80",
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  heightClassName?: string;
}) => (
  <PrimaryBox className={className}>
    <div className="mb-5">
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className={heightClassName}>{children}</div>
  </PrimaryBox>
);
