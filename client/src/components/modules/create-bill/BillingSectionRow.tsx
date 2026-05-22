"use client";

import { BillItemType } from "@/types/dto/invoiceDto";
import { calculatePrice } from "@/utils/price-calculator";
import { useEffect, useId, useState } from "react";
import { ProductSearchInput } from "./ProductSearchInput";
import { StockInput } from "@/components/ui/StockInput";
import { Input } from "@/components/ui/Input";
import { Trash2 } from "lucide-react";
import { ProductDto } from "@/types/dto/productDto";
import { Button } from "@/components/ui/Button";

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
  const [selectedItem, setSelectedItem] = useState<ProductDto | null>(null);
  const [productFields, setProductFields] = useState<BillItemType>(item);

  // We maintain a separate state for input strings to allow "0." or "0.05"
  const [localInputs, setLocalInputs] = useState({
    netQuantity: String(item.netQuantity || 0),
    totalPrice: String(item.totalPrice || 0),
  });

  useEffect(() => {
    if (selectedItem) {
      const quantity = 1;
      const calc = calculatePrice(quantity, selectedItem.pricePerQuantity);

      const newItem: BillItemType = {
        ...item,
        id,
        product: {
          id: selectedItem._id,
          name: selectedItem.name,
          sku: selectedItem.sku,
        },
        netQuantity: quantity,
        totalPrice: calc.price,
        stockUnit: selectedItem.stockUnit,
        totalProfit: calc.profit,
      };

      setProductFields(newItem);
      setLocalInputs({
        netQuantity: String(quantity),
        totalPrice: String(calc.price),
      });
      onFieldUpdate(newItem);
    }
  }, [selectedItem]);

  const handleInputChange = (key: keyof BillItemType, rawValue: string) => {
    if (key === "netQuantity" || key === "totalPrice") {
      setLocalInputs((prev) => ({ ...prev, [key]: rawValue }));
    }

    const numValue = parseFloat(rawValue);
    const safeValue = isNaN(numValue) ? 0 : numValue;

    const updated = { ...productFields, id, [key]: safeValue };
    setProductFields(updated);
    onFieldUpdate(updated);

    if (key === "netQuantity" && selectedItem) {
      const calc = calculatePrice(safeValue, selectedItem.pricePerQuantity);

      const withTotal = {
        ...updated,
        totalPrice: calc.price,
        totalProfit: calc.profit,
      };

      setProductFields(withTotal);

      setLocalInputs((prev) => ({
        ...prev,
        totalPrice: String(calc.price),
      }));

      onFieldUpdate(withTotal);
    }
  };

  return (
    <tr className="border-t border-gray-200">
      <td className="px-2 py-3">
        <ProductSearchInput
          onSelect={(e) => setSelectedItem(e)}
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
          unit={selectedItem?.stockUnit}
          className="w-30"
        />
      </td>

      <td className="px-2 py-3">
        <Input
          type="number"
          placeholder="0.00"
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
