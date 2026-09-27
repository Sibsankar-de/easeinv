"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  searchProductsThunk,
  selectInventoryState,
} from "@/store/features/inventorySlice";
import { ProductDto } from "@/types/dto/productDto";
import { SelectableItem } from "@/components/ui/SelectableInputDropdown";
import { calculatePrice } from "@/utils/price-calculator";
import { convertUnit } from "@/utils/conversion";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { useEffect, useRef, useState } from "react";
import { SearchableInput } from "@/components/ui/SearchableInput";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { Badge } from "@/components/ui/Badge";
import {
  StockStatusBadgeVariantMap,
  StockStatusMap,
} from "@/constants/productConstants";

export function ProductSearchInput({
  onSelect,
  value,
  index,
}: {
  onSelect: (p: ProductDto) => void;
  value: string;
  index: number;
}) {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { searchStatus } = useSelector(selectInventoryState);
  const {
    data: { storeSettings, currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const [searchList, setSearchList] = useState<ProductDto[]>([]);

  const handleSearch = (query: string) => {
    if (!query || !query.trim() || query.trim().length < 2) return;

    dispatch(searchProductsThunk({ storeId, query }))
      .unwrap()
      .then((res: ProductDto[]) => {
        setSearchList(res);
      });
  };

  const handleSelect = (p: ProductDto) => {
    setSearchList([]);
    onSelect(p);
  };

  // key board event
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      const key = e.key;
      if (e.ctrlKey && key === "f" && inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };

    document.addEventListener("keydown", handleKeyEvent);
    return () => document.removeEventListener("keydown", handleKeyEvent);
  }, []);

  const isSearching = searchStatus === "loading";

  return (
    <SearchableInput
      items={searchList}
      value={value}
      placeholder="Type product name/sku/gtin"
      inputProps={{ ref: inputRef, autoFocus: index > 0 }}
      closeOnEmpty={false}
      minCharsToSearch={2}
      trimQuery
      isLoading={isSearching}
      onSearch={handleSearch}
      getLabel={(p) => p.name}
      onSelect={handleSelect}
    >
      {(items) =>
        items.map((p, i) => (
          <SelectableItem
            key={p.id}
            item={p}
            index={i}
            className="flex justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[15px]">{p.name}</p>
                <Badge variant={StockStatusBadgeVariantMap[p.stockStatus]}>
                  {StockStatusMap[p.stockStatus]}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {p.sku}
                {p.mrp !== null && p.mrp !== undefined && p.mrp > 0 && (
                  <span className="ml-2 font-normal">
                    • MRP: {currencySymbol}
                    {p.mrp}
                  </span>
                )}
              </p>
            </div>
            <div className="font-normal text-right">
              <p className="text-green-800 text-sm">
                {currencySymbol}
                {
                  calculatePrice(1, p.pricePerQuantity, {
                    baseUnit: p.stockUnit,
                    selectedUnit: p.stockUnit,
                    unitGroups: p.unitGroups ?? [],
                  }).price
                }{" "}
                / {convertUnit(p.stockUnit, storeSettings.customUnits)}
              </p>
              <p className="text-sm">
                {p.totalStock}{" "}
                {convertUnit(p.stockUnit, storeSettings.customUnits)} left
              </p>
            </div>
          </SelectableItem>
        ))
      }
    </SearchableInput>
  );
}
