"use client";

import { Plus } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { BillItemType } from "@/types/dto/invoiceDto";
import { useSelector } from "react-redux";
import { SecondaryInput } from "../../ui/SecondaryInput";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { ConditionalDiv } from "@/components/ui/ConditionalDiv";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { BillingSectionRow } from "./BillingSectionRow";
import { roundToDecimal } from "@/utils/conversion";
import { ProductDto } from "@/types/dto/productDto";
import { calculatePrice } from "@/utils/price-calculator";

const generateRandomId = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export type BillCalculationsType = {
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  discountPercent?: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  totalProfit: number;
  roundupTotal: boolean;
};

interface BillingFormProps {
  data?: {
    items?: BillItemType[];
    calculations?: Partial<BillCalculationsType>;
  };
  onBillChange: (data: {
    items: BillItemType[];
    calculations: BillCalculationsType;
  }) => void;
}

export const BillingForm = ({ data, onBillChange }: BillingFormProps) => {
  const {
    data: { storeSettings, currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const initialBillItem: BillItemType = {
    id: generateRandomId(),
    product: { id: "", name: "", sku: "" },
    netQuantity: 0,
    totalPrice: 0,
    totalProfit: 0,
    stockUnit: "",
  };

  const [items, setItems] = useState<BillItemType[]>(
    data?.items && data.items.length > 0 ? data.items : [initialBillItem],
  );
  const [discountPercent, setDiscountPercent] = useState(
    data?.calculations?.discountPercent
      ? String(data.calculations.discountPercent)
      : "",
  );
  const [roundupTotal, setRoundupTotal] = useState<boolean>(
    data?.calculations?.roundupTotal ??
      (storeSettings?.roundupInvoiceTotal || false),
  );
  const [paidAmountInput, setPaidAmountInput] = useState<number | null>(
    data?.calculations?.paidAmount !== undefined
      ? data.calculations.paidAmount
      : null,
  );

  const calculations: BillCalculationsType = useMemo(() => {
    const subTotal = roundToDecimal(
      items.reduce((sum, item) => sum + item.totalPrice, 0),
    );
    const subTotalProfit = items.reduce(
      (sum, item) => sum + item.totalProfit,
      0,
    );
    const taxAmount = 0;
    const discountAmount = roundToDecimal(
      (Number(discountPercent) * subTotal) / 100,
    );
    let total = roundToDecimal(subTotal + taxAmount - Number(discountAmount));

    if (roundupTotal) total = Math.round(total);

    const paidAmount = paidAmountInput !== null ? paidAmountInput : total;
    const dueAmount = roundToDecimal(Math.max(0, total - paidAmount));
    const totalProfit = subTotalProfit - discountAmount;

    return {
      subTotal,
      taxAmount,
      discountAmount,
      discountPercent: Number(discountPercent) || 0,
      total,
      paidAmount,
      dueAmount,
      totalProfit,
      roundupTotal,
    };
  }, [items, discountPercent, roundupTotal, paidAmountInput]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: generateRandomId(),
        product: {
          id: "",
          name: "",
          sku: "",
        },
        netQuantity: 0,
        totalPrice: 0,
        totalProfit: 0,
        stockUnit: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (item: BillItemType) => {
    setItems((prev) => {
      const list = [...prev];
      const index = list.findIndex((e) => e.id === item.id);
      if (index !== -1) list[index] = { ...item };
      return list;
    });
  };

  const handleSelectProduct = (rowId: string, product: ProductDto) => {
    setItems((prev) => {
      // Find if another row already exists with the same productId
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.id !== rowId,
      );

      if (existingIndex !== -1) {
        // Merge into existing item: quantity + 1, keep existing unit, recalculate price
        const existingItem = prev[existingIndex];
        const newQuantity = (existingItem.netQuantity || 0) + 1;
        const currentUnit = existingItem.stockUnit || product.stockUnit;

        const calc = calculatePrice(newQuantity, product.pricePerQuantity, {
          baseUnit: product.stockUnit,
          selectedUnit: currentUnit,
          unitGroups: product.unitGroups ?? [],
        });

        const updatedExistingItem: BillItemType = {
          ...existingItem,
          netQuantity: newQuantity,
          pricePerQuantity: calc.chosenTier,
          totalPrice: calc.price,
          totalProfit: calc.profit,
          stockUnit: currentUnit,
        };

        const updatedList = [...prev];
        updatedList[existingIndex] = updatedExistingItem;

        // Clear the duplicate row instead of removing it
        const currentIndex = updatedList.findIndex((item) => item.id === rowId);
        if (currentIndex !== -1) {
          updatedList[currentIndex] = {
            id: rowId,
            product: {
              id: "",
              name: "",
              sku: "",
            },
            netQuantity: 0,
            totalPrice: 0,
            totalProfit: 0,
            stockUnit: "",
          };
        }

        return updatedList;
      }

      // No duplicate found: update current row with 1 quantity
      const currentIndex = prev.findIndex((item) => item.id === rowId);
      if (currentIndex === -1) return prev;

      const quantity = 1;
      const calc = calculatePrice(quantity, product.pricePerQuantity, {
        baseUnit: product.stockUnit,
        selectedUnit: product.stockUnit,
        unitGroups: product.unitGroups ?? [],
      });

      const newItem: BillItemType = {
        ...prev[currentIndex],
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
        },
        pricePerQuantity: calc.chosenTier,
        netQuantity: quantity,
        totalPrice: calc.price,
        stockUnit: product.stockUnit,
        totalProfit: calc.profit,
      };

      const updatedList = [...prev];
      updatedList[currentIndex] = newItem;
      return updatedList;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        addItem();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    const filteredItems = items.filter((e) => e.product.id !== "");
    onBillChange({
      items: filteredItems,
      calculations,
    });
  }, [items, calculations, onBillChange]);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-gray-900">Items</Label>
          <Button onClick={addItem} variant="outline" className="text-primary">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        <div className="border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-gray-700 px-2 py-3">
                  Product name
                </th>
                <th className="text-center text-gray-700 px-2 py-3 w-24">
                  Quantity
                </th>
                <th className="text-center text-gray-700 px-2 py-3 w-32">
                  Price ({currencySymbol})
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <BillingSectionRow
                  id={item.id}
                  key={item.id}
                  item={item}
                  index={index}
                  onFieldUpdate={updateItem}
                  onSelectProduct={(product) =>
                    handleSelectProduct(item.id, product)
                  }
                  onRemoveItem={removeItem}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-between">
        <div className="space-y-4">
          <div>
            <Label>Discounts</Label>
            <SecondaryInput
              type="number"
              placeholder="Discount percent (%)"
              field="%"
              onChange={(e) => setDiscountPercent(e)}
              value={discountPercent}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="round-total" className="mb-0">
              Roundup total
            </Label>
            <ToggleButton
              id="round-total"
              isActive={roundupTotal}
              onChange={(e) => setRoundupTotal(e)}
            />
          </div>
        </div>

        <div className="w-80">
          <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                {currencySymbol}
                {calculations.subTotal}
              </span>
            </div>

            <ConditionalDiv
              condition={storeSettings?.defaultTaxRate}
              className="flex items-center justify-between"
            >
              <span className="text-gray-600">
                Tax ({storeSettings?.defaultTaxRate}%)
              </span>
              <span className="text-gray-900">{currencySymbol}0</span>
            </ConditionalDiv>

            <ConditionalDiv
              condition={calculations.discountAmount}
              className="flex items-center justify-between"
            >
              <span className="text-gray-600">
                Discount (
                <span className="text-green-600">{discountPercent}%</span>)
              </span>
              <span className="text-green-600">
                - {currencySymbol}
                {calculations.discountAmount}
              </span>
            </ConditionalDiv>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">
                {currencySymbol}
                {calculations.total}
              </span>
            </div>

            <div className="w-full flex items-center justify-between">
              <span>Paid Amount</span>
              <Input
                type="number"
                placeholder="0.00"
                className="w-32"
                inputClass="text-right"
                value={calculations.paidAmount}
                onChange={(e) => setPaidAmountInput(Number(e))}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-900">Due Amount</span>
              <span className="text-gray-900">
                {currencySymbol}
                {calculations.dueAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
