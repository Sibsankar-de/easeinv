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
  onRemoveItem,
}: {
  id: string;
  item: BillItemType;
  index: number;
  onFieldUpdate: (doc: BillItemType) => void;
  onRemoveItem: (id: string) => void;
}) {
  const baseId = useId();
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const [selectedItem, setSelectedItem] = useState<ProductDto | null>(
    (item.product as unknown as ProductDto) || null,
  );
  const [selectedUnit, setSelectedUnit] = useState<string>(
    item.stockUnit || (item.product as unknown as ProductDto)?.stockUnit || "",
  );
  const [productFields, setProductFields] = useState<BillItemType>(item);

  // We maintain a separate state for input strings to allow "0." or "0.05"
  const [localInputs, setLocalInputs] = useState({
    netQuantity: String(item.netQuantity || 0),
    totalPrice: String(item.totalPrice || 0),
  });

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
    setSelectedItem(p);
    setSelectedUnit(p.stockUnit);

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

    setProductFields(newItem);
    setLocalInputs({
      netQuantity: String(quantity),
      totalPrice: String(calc.price),
    });
    onFieldUpdate(newItem);
  };

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    const quantity = parseFloat(localInputs.netQuantity) || 0;
    if (selectedItem) {
      const calc = calculatePrice(quantity, selectedItem.pricePerQuantity, {
        baseUnit: selectedItem.stockUnit,
        selectedUnit: unit,
        unitGroups: selectedItem.unitGroups ?? [],
      });
      const withTotal = {
        ...productFields,
        stockUnit: unit,
        pricePerQuantity: calc.chosenTier,
        totalPrice: calc.price,
        totalProfit: calc.profit,
      };
      setProductFields(withTotal);
      setLocalInputs((prev) => ({ ...prev, totalPrice: String(calc.price) }));
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
      if (selectedItem) {
        const calc = calculatePrice(quantity, selectedItem.pricePerQuantity, {
          baseUnit: selectedItem.stockUnit,
          selectedUnit,
          unitGroups: selectedItem.unitGroups ?? [],
        });
        const withTotal = {
          ...productFields,
          netQuantity: quantity,
          pricePerQuantity: calc.chosenTier,
          totalPrice: calc.price,
          totalProfit: calc.profit,
        };
        setProductFields(withTotal);
        setLocalInputs((prev) => ({ ...prev, totalPrice: String(calc.price) }));
        onFieldUpdate(withTotal);
      } else {
        const withQuantity = {
          ...productFields,
          netQuantity: quantity,
        };
        setProductFields(withQuantity);
        onFieldUpdate(withQuantity);
      }
    } else if (key === "totalPrice") {
      const price = parseFloat(val) || 0;
      const withTotal = {
        ...productFields,
        totalPrice: price,
      };
      setProductFields(withTotal);
      onFieldUpdate(withTotal);
    }
  };

  return (
    <tr className="border-t border-gray-200">
      <td className="px-2 py-3">
        <ProductSearchInput
          onSelect={handleSelectProduct}
          value={productFields.product.name}
          index={index}
        />
      </td>

      <td className="px-2 py-3">
        <StockInput
          id={`${baseId}-quantity`}
          placeholder="0.00"
          value={localInputs.netQuantity}
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
          value={localInputs.totalPrice}
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
