"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  searchProductsThunk,
  selectProductState,
} from "@/store/features/productSlice";
import { ProductDto } from "@/types/dto/productDto";
import { SelectableItem } from "@/components/ui/SelectableInputDropdown";
import { calculatePrice } from "@/utils/price-calculator";
import { convertUnit } from "@/utils/conversion";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { useEffect, useRef, useState } from "react";
import { SearchableInput } from "@/components/ui/SearchableInput";
import { useStoreNavigation } from "@/hooks/store-navigation";

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
  const { searchStatus } = useSelector(selectProductState);
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const [input, setInput] = useState("");
  const [searchList, setSearchList] = useState<ProductDto[]>([]);

  const handleSearch = (query: string) => {
    if (!query || !query.trim() || query.trim().length < 2) return;

    dispatch(searchProductsThunk({ storeId, query }))
      .unwrap()
      .then((res: any) => {
        setSearchList(res);
      });
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
      value={input}
      placeholder="Type product name/sku/gtin"
      inputProps={{ ref: inputRef, autoFocus: index > 0 }}
      closeOnEmpty={false}
      minCharsToSearch={2}
      trimQuery
      isLoading={isSearching}
      onSearch={handleSearch}
      getLabel={(p) => p.name}
      onSelect={onSelect}
    >
      {(items) =>
        items.map((p, i) => (
          <SelectableItem
            key={p._id}
            item={p}
            index={i}
            className="flex justify-between"
          >
            <div>
              <p className="text-[15px]">{p.name}</p>
              <p className="text-sm text-gray-600">{p.sku}</p>
            </div>
            <div>
              <p className="text-green-800">
                &#8377;{calculatePrice(1, p.pricePerQuantity).price} /{" "}
                {convertUnit(p.stockUnit, storeSettings.customUnits)}
              </p>
            </div>
          </SelectableItem>
        ))
      }
    </SearchableInput>
  );
}
