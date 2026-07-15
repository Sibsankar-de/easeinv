"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConditionalDiv } from "@/components/ui/ConditionalDiv";
import { cn } from "@/components/utils";
import { RoleBadgeVarient } from "@/constants/storeUserRole";
import { StoreDto } from "@/types/dto/storeDto";
import { formatDateStr } from "@/utils/formatDate";
import { Dot, MapPin, Settings, Store } from "lucide-react";
import { useRouter } from "next/navigation";

export const StoreCard = ({ store }: { store: StoreDto }) => {
  const router = useRouter();
  return (
    <div
      className={cn(
        `bg-white rounded-lg border p-6 border-border flex justify-between items-baseline`,
        "transition-all hover:shadow-md",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-100`}
        >
          <Store className={`w-6 h-6 text-indigo-600`} />
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-gray-900">{store.name}</h3>
            <Badge variant={RoleBadgeVarient[store.role]}>{store.role}</Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">{store.businessType}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ConditionalDiv
              className="flex items-center gap-1"
              condition={store.address}
            >
              <MapPin className="w-3 h-3" />
              {store.address}
              <Dot size={15} />
            </ConditionalDiv>
            <div>Since {formatDateStr(store?.createdAt || "").dateStr}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => router.push(`/stores/${store?.id}`)}>
          <Store size={15} />
          Goto store
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/stores/${store?.id}/settings`)}
        >
          <Settings size={20} />
        </Button>
      </div>
    </div>
  );
};
