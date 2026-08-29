"use client";

import React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { OrderStatus } from "@/types/dto/orderDto";
import { Clock, RefreshCw, Truck, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/components/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  OrderStatus,
  {
    variant: BadgeVariant;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  [OrderStatus.PENDING]: {
    variant: "warning",
    label: "Pending",
    icon: Clock,
  },
  [OrderStatus.PROCESSING]: {
    variant: "info",
    label: "Processing",
    icon: RefreshCw,
  },
  [OrderStatus.DISPATCHED]: {
    variant: "secondary",
    label: "Dispatched",
    icon: Truck,
  },
  [OrderStatus.COMPLETED]: {
    variant: "success",
    label: "Completed",
    icon: CheckCircle2,
  },
  [OrderStatus.REJECTED]: {
    variant: "danger",
    label: "Rejected",
    icon: XCircle,
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const config = statusConfig[status] || {
    variant: "outline",
    label: status,
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium normal-case tracking-normal px-2.5 py-1 text-xs",
        className,
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
    </Badge>
  );
};
