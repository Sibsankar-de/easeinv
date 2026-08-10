"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Check, Loader2, Store } from "lucide-react";
import { cn } from "@/components/utils";
import { selectStoreState, fetchStoreList } from "@/store/features/storeSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { AppDispatch } from "@/store/store";
import { StoreDto } from "@/types/dto/storeDto";
import { Dropdown } from "@/components/ui/Dropdown";

// Two-letter initials from store name
function storeInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Deterministic hue from store id
function storeHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

function StoreAvatar({ store, size = 28 }: { store: StoreDto; size?: number }) {
  const hue = storeHue(store.id);
  return (
    <span
      className="rounded-lg flex items-center justify-center shrink-0 font-semibold text-white select-none leading-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: `hsl(${hue}, 62%, 46%)`,
      }}
    >
      {storeInitials(store.name)}
    </span>
  );
}

export function StoreSelector() {
  const router = useRouter();
  const params = useParams();
  const currentStoreId = params?.store_id as string | undefined;

  const dispatch = useDispatch<AppDispatch>();
  const {
    data: { storeList },
    status,
  } = useSelector(selectStoreState);
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);

  const [open, setOpen] = useState(false);

  // Fetch once
  useEffect(() => {
    if (status === "idle") dispatch(fetchStoreList());
  }, [dispatch, status]);

  const handleSelect = (store: StoreDto) => {
    setOpen(false);
    if (store.id !== currentStoreId) {
      router.push(`/stores/${store.id}/dashboard`);
    }
  };

  const isLoading = status === "loading";
  const hasStore = !!currentStore?.id;

  return (
    <div className="relative">
      <button
        type="button"
        id="store-selector-trigger"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 sm:gap-3 pr-2 sm:pr-4 pl-2 rounded-xl py-1 px-2",
          "cursor-pointer select-none transition-all duration-200",
          "hover:bg-gray-100 active:bg-gray-300",
          open && "bg-gray-100",
        )}
      >
        {hasStore ? (
          <StoreAvatar store={currentStore} size={28} />
        ) : (
          <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-gray-400" />
          </span>
        )}

        <div className="text-left max-sm:hidden">
          <p className="text-gray-900 text-sm font-medium leading-tight max-w-[90px] sm:max-w-[130px] truncate">
            {currentStore?.name ?? "Select store"}
          </p>
          <p className="text-xs text-gray-500 leading-tight capitalize">
            {currentStore?.type?.toLowerCase() ?? "store"}
          </p>
        </div>

        {isLoading ? (
          <Loader2 className="w-4 h-4 text-gray-400 shrink-0 animate-spin max-sm:hidden" />
        ) : (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 max-sm:hidden",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      <Dropdown
        openState={open}
        onClose={() => setOpen(false)}
        className="mt-2 right-0 left-auto w-64 p-0 rounded-2xl overflow-hidden border border-gray-100 shadow-xl"
      >
        <div className="px-3 pt-3 pb-2 border-b border-gray-100 bg-gray-50/60">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Your stores
          </p>
        </div>

        <ul
          role="listbox"
          className="max-h-60 overflow-y-auto py-1"
          aria-label="Store list"
        >
          {isLoading && (
            <li className="flex items-center justify-center gap-2 py-7 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </li>
          )}

          {!isLoading && storeList.length === 0 && (
            <li className="py-7 text-center text-xs text-gray-400">
              No stores found
            </li>
          )}

          {!isLoading &&
            storeList.map((store) => {
              const isActive = store.id === currentStoreId;
              return (
                <li key={store.id} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => handleSelect(store)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-left",
                      "transition-colors duration-100 cursor-pointer",
                      isActive ? "bg-gray-50" : "hover:bg-gray-50",
                    )}
                  >
                    <StoreAvatar store={store} size={32} />

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate leading-tight",
                          isActive ? "text-gray-900" : "text-gray-800",
                        )}
                      >
                        {store.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate capitalize leading-tight mt-0.5">
                        {store.type?.toLowerCase() ?? "store"}
                      </p>
                    </div>

                    {isActive ? (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px]",
                          "font-semibold ring-1 ring-inset capitalize shrink-0",
                          store.role?.toLowerCase() === "owner"
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : "bg-sky-50 text-sky-700 ring-sky-200",
                        )}
                      >
                        {store.role}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
        </ul>
      </Dropdown>
    </div>
  );
}
