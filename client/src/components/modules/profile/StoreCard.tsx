"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/utils";
import { RoleBadgeVarient } from "@/constants/storeUserRole";
import { StoreDto } from "@/types/dto/storeDto";
import { formatDateStr } from "@/utils/formatDate";
import {
  ArrowRight,
  Calendar,
  Globe,
  MapPin,
  Settings,
  Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PrimaryBox } from "@/components/ui/PrimaryBox";

export const StoreCard = ({ store }: { store: StoreDto }) => {
  const router = useRouter();

  return (
    <PrimaryBox
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5",
        "transition-all duration-300 hover:shadow-sm hover:border-primary/50 group",
      )}
    >
      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
        {/* Left: Store Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100 shrink-0",
            "group-hover:scale-105 transition-transform",
          )}
        >
          <Store className="w-6 h-6 text-indigo-600" />
        </div>

        {/* Content Details (Grouped together) */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3
              className={cn(
                "text-base font-semibold text-gray-900 truncate leading-snug",
                "group-hover:text-primary transition-colors duration-100",
              )}
            >
              {store.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {store.type && <Badge variant="secondary">{store.type}</Badge>}
              <Badge variant={RoleBadgeVarient[store.role]}>{store.role}</Badge>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {store.addressLine && (
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate max-w-[200px]">
                  {store.addressLine}
                </span>
              </div>
            )}

            {store.country && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate max-w-[200px]">{store.country}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Since {formatDateStr(store?.createdAt || "").dateStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Button
          onClick={() => router.push(`/stores/${store?.id}`)}
          className="flex-1 sm:flex-initial justify-center"
        >
          <span>Go to Store</span>
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push(`/stores/${store?.id}/settings`)}
          tooltip="Store Settings"
          className="p-2"
        >
          <Settings size={18} />
        </Button>
      </div>
    </PrimaryBox>
  );
};
