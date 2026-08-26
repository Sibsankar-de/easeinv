"use client";

import { BillItemType } from "@/types/dto/invoiceDto";
import { calculatePrice } from "@/utils/price-calculator";
import { useId, useState } from "react";
import { ProductSearchInput } from "./ProductSearchInput";
import { StockInput } from "@/components/ui/StockInput";
import { Input } from "@/components/ui/Input";
import { Trash2 } from "lucide-react";
import { ProductDto, UnitGroupType } from "@/types/dto/productDto";
import { Button } from "@/components/ui/Button";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { convertUnit } from "@/utils/conversion";
import { SelectOptionType } from "@/types/SelectType";

export function BillingSectionRow({
  id,
  item,
  index,
  onFieldUpdate,
  onSelectProduct,
  onRemoveItem,
}: {
  id: string;
  item: BillItemType;
  index: number;
  onFieldUpdate: (doc: BillItemType) => void;
  onSelectProduct?: (product: ProductDto) => void;
  onRemoveItem: (id: string) => void;
}) {
  const baseId = useId();
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const selectedItem =
    item.product && item.product.id
      ? (item.product as unknown as ProductDto)
      : null;
  const selectedUnit =
    item.stockUnit || (item.product as unknown as ProductDto)?.stockUnit || "";

  // Maintain local state for input strings during active typing
  const [localInputs, setLocalInputs] = useState<{
    netQuantity?: string;
    totalPrice?: string;
  }>({});

  const netQuantityDisplay =
    localInputs.netQuantity !== undefined
      ? localInputs.netQuantity
      : String(item.netQuantity || 0);

  const totalPriceDisplay =
    localInputs.totalPrice !== undefined
      ? localInputs.totalPrice
      : String(item.totalPrice || 0);

  // Build unit options from product's unitGroups + stockUnit
  const groupUnitOptions: SelectOptionType[] = selectedItem
    ? [
        ...(selectedItem.unitGroups ?? []).map((ug: UnitGroupType) => ({
          key: ug.unit,
          value: convertUnit(ug.unit, storeSettings.customUnits),
        })),
        {
          key: selectedItem.stockUnit,
          value: convertUnit(selectedItem.stockUnit, storeSettings.customUnits),
        },
      ]
    : item.stockUnit
      ? [
          {
            key: item.stockUnit,
            value: convertUnit(item.stockUnit, storeSettings.customUnits),
          },
        ]
      : [];

  const handleSelectProduct = (p: ProductDto) => {
    setLocalInputs({});
    if (onSelectProduct) {
      onSelectProduct(p);
      return;
    }

    const quantity = 1;
    const calc = calculatePrice(quantity, p.pricePerQuantity, {
      baseUnit: p.stockUnit,
      selectedUnit: p.stockUnit,
      unitGroups: p.unitGroups ?? [],
    });

    const newItem: BillItemType = {
      ...item,
      id,
      product: {
        id: p.id,
        name: p.name,
        sku: p.sku,
      },
      pricePerQuantity: calc.chosenTier,
      netQuantity: quantity,
      totalPrice: calc.price,
      stockUnit: p.stockUnit,
      totalProfit: calc.profit,
    };

    onFieldUpdate(newItem);
  };

  const handleUnitChange = (unit: string) => {
    const quantity = parseFloat(netQuantityDisplay) || 0;
    if (selectedItem && selectedItem.pricePerQuantity) {
      const calc = calculatePrice(quantity, selectedItem.pricePerQuantity, {
        baseUnit: selectedItem.stockUnit,
        selectedUnit: unit,
        unitGroups: selectedItem.unitGroups ?? [],
      });
      const withTotal = {
        ...item,
        stockUnit: unit,
        pricePerQuantity: calc.chosenTier,
        totalPrice: calc.price,
        totalProfit: calc.profit,
      };
      setLocalInputs((prev) => ({ ...prev, totalPrice: String(calc.price) }));
      onFieldUpdate(withTotal);
    } else {
      const withTotal = {
        ...item,
        stockUnit: unit,
      };
      onFieldUpdate(withTotal);
    }
  };

  const handleInputChange = (
    key: "netQuantity" | "totalPrice",
    val: string,
  ) => {
    setLocalInputs((prev) => ({ ...prev, [key]: val }));

    if (key === "netQuantity") {
      const quantity = parseFloat(val) || 0;
      if (selectedItem && selectedItem.pricePerQuantity) {
        const calc = calculatePrice(quantity, selectedItem.pricePerQuantity, {
          baseUnit: selectedItem.stockUnit,
          selectedUnit,
          unitGroups: selectedItem.unitGroups ?? [],
        });
        const withTotal = {
          ...item,
          netQuantity: quantity,
          pricePerQuantity: calc.chosenTier,
          totalPrice: calc.price,
          totalProfit: calc.profit,
        };
        setLocalInputs((prev) => ({ ...prev, totalPrice: String(calc.price) }));
        onFieldUpdate(withTotal);
      } else {
        const withQuantity = {
          ...item,
          netQuantity: quantity,
        };
        onFieldUpdate(withQuantity);
      }
    } else if (key === "totalPrice") {
      const price = parseFloat(val) || 0;
      const withTotal = {
        ...item,
        totalPrice: price,
      };
      onFieldUpdate(withTotal);
    }
  };

  return (
    <tr className="border-t border-gray-200">
      <td className="px-2 py-3">
        <ProductSearchInput
          onSelect={handleSelectProduct}
          value={item.product.name}
          index={index}
        />
      </td>

      <td className="px-2 py-3">
        <StockInput
          id={`${baseId}-quantity`}
          placeholder="0.00"
          value={netQuantityDisplay}
          onChange={(e) => handleInputChange("netQuantity", e)}
          isSelect={true}
          options={groupUnitOptions}
          unit={selectedUnit || item.stockUnit || ""}
          onUnitChange={handleUnitChange}
          className="w-30"
        />
      </td>

      <td className="px-2 py-3">
        <Input
          type="number"
          placeholder="0.00"
          inputClass="text-right"
          value={totalPriceDisplay}
          onChange={(e) => handleInputChange("totalPrice", e)}
        />
      </td>

      <td className="px-2 py-3">
        <Button
          variant="outline"
          className="p-2 text-red-300"
          onClick={() => onRemoveItem(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}
