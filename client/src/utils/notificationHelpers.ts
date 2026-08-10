import { NotificationType } from "@/types/dto/notificationDto";
import { BadgeVariant } from "@/components/ui/Badge";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PackageX,
  UserPlus,
  Users,
  ShieldCheck,
  MailCheck,
  KeyRound,
  Bell,
  LucideIcon,
} from "lucide-react";

export function formatRelativeTime(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime())) return "Unknown date";
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export interface NotificationMeta {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
}

export function getNotificationMeta(type: NotificationType): NotificationMeta {
  switch (type) {
    case "INVOICE_CREATED":
      return {
        icon: FileText,
        iconBg: "bg-blue-50 hover:bg-blue-100/80",
        iconColor: "text-primary",
        borderColor: "border-blue-200/80",
        badgeLabel: "Invoice",
        badgeVariant: "info",
      };
    case "INVOICE_PAID":
      return {
        icon: CheckCircle2,
        iconBg: "bg-emerald-50 hover:bg-emerald-100/80",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-200/80",
        badgeLabel: "Paid",
        badgeVariant: "success",
      };
    case "INVOICE_OVERDUE":
      return {
        icon: AlertCircle,
        iconBg: "bg-red-50 hover:bg-red-100/80",
        iconColor: "text-red-600",
        borderColor: "border-red-200/80",
        badgeLabel: "Overdue",
        badgeVariant: "danger",
      };
    case "STOCK_LOW":
      return {
        icon: AlertTriangle,
        iconBg: "bg-amber-50 hover:bg-amber-100/80",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200/80",
        badgeLabel: "Low Stock",
        badgeVariant: "warning",
      };
    case "STOCK_OUT":
      return {
        icon: PackageX,
        iconBg: "bg-rose-50 hover:bg-rose-100/80",
        iconColor: "text-rose-600",
        borderColor: "border-rose-200/80",
        badgeLabel: "Out of Stock",
        badgeVariant: "danger",
      };
    case "STORE_USER_INVITED":
      return {
        icon: UserPlus,
        iconBg: "bg-purple-50 hover:bg-purple-100/80",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200/80",
        badgeLabel: "Invite",
        badgeVariant: "secondary",
      };
    case "STORE_USER_JOINED":
      return {
        icon: Users,
        iconBg: "bg-indigo-50 hover:bg-indigo-100/80",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-200/80",
        badgeLabel: "Team",
        badgeVariant: "info",
      };
    case "STORE_USER_ROLE_CHANGED":
      return {
        icon: ShieldCheck,
        iconBg: "bg-teal-50 hover:bg-teal-100/80",
        iconColor: "text-teal-600",
        borderColor: "border-teal-200/80",
        badgeLabel: "Role",
        badgeVariant: "dark",
      };
    case "EMAIL_VERIFIED":
      return {
        icon: MailCheck,
        iconBg: "bg-green-50 hover:bg-green-100/80",
        iconColor: "text-green-600",
        borderColor: "border-green-200/80",
        badgeLabel: "Account",
        badgeVariant: "success",
      };
    case "PASSWORD_CHANGED":
      return {
        icon: KeyRound,
        iconBg: "bg-orange-50 hover:bg-orange-100/80",
        iconColor: "text-orange-600",
        borderColor: "border-orange-200/80",
        badgeLabel: "Security",
        badgeVariant: "warning",
      };
    default:
      return {
        icon: Bell,
        iconBg: "bg-slate-50 hover:bg-slate-100",
        iconColor: "text-slate-600",
        borderColor: "border-slate-200",
        badgeLabel: "System",
        badgeVariant: "outline",
      };
  }
}

export function getNotificationNavigation(
  type: NotificationType,
  metadata: Record<string, any>,
): string | null {
  const storeId = metadata?.storeId;
  switch (type) {
    case "INVOICE_CREATED":
    case "INVOICE_PAID":
    case "INVOICE_OVERDUE":
      return storeId ? `/stores/${storeId}/invoices` : null;
    case "STOCK_LOW":
    case "STOCK_OUT":
      if (storeId && metadata?.productId) {
        return `/stores/${storeId}/inventory/product/${metadata.productId}/edit`;
      }
      return storeId ? `/stores/${storeId}/inventory` : null;
    case "STORE_USER_INVITED":
    case "STORE_USER_JOINED":
    case "STORE_USER_ROLE_CHANGED":
      return storeId ? `/stores/${storeId}/settings` : null;
    case "EMAIL_VERIFIED":
    case "PASSWORD_CHANGED":
      return "/profile";
    default:
      return null;
  }
}
