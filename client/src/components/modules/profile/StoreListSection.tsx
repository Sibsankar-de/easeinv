"use client";

import { Button } from "@/components/ui/Button";
import { Plus, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { StoreCreateModal } from "./StoreCreateModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchStoreList, selectStoreState } from "@/store/features/storeSlice";
import { StoreCard } from "./StoreCard";
import { StoreCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/components/utils";

export const StoreListSection = () => {
  const dispatch = useDispatch();
  const storeState = useSelector(selectStoreState);
  const storeStatus = storeState.status;
  const { storeList } = storeState.data;

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // fetch store list
  useEffect(() => {
    if (storeStatus === "idle") dispatch(fetchStoreList());
  }, [dispatch, storeList]);

  return (
    <section id="stores" className="mt-8">
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6",
        )}
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            My Stores
          </h2>
          <p className="text-sm text-gray-500">
            Manage and switch between your business stores
          </p>
        </div>
        <Button onClick={() => setIsStoreModalOpen((p) => !p)}>
          <Plus size={16} />
          Create Store
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {storeStatus === "loading"
          ? [1, 2, 3].map((i) => <StoreCardSkeleton key={i} />)
          : storeList.map((store, index) => (
              <StoreCard store={store} key={index} />
            ))}
        {storeStatus !== "loading" && storeList.length === 0 && (
          <EmptyState
            className="col-span-full bg-white border border-dashed rounded-xl py-12"
            icon={<Store className="w-8 h-8 text-gray-400" />}
            title="No stores found"
            description="You haven't created any stores yet. Create your first store to start managing your business."
            action={
              <Button onClick={() => setIsStoreModalOpen(true)}>
                <Plus size={15} />
                Create Store
              </Button>
            }
          />
        )}
      </div>

      <StoreCreateModal
        key={isStoreModalOpen ? "open" : "closed"}
        openState={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />
    </section>
  );
};
