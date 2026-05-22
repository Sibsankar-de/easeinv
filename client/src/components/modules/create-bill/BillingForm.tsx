"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
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

const generateRandomId = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

interface BillingFormProps {
  data?: Record<string, any>;
  onBillChange: (data: Record<string, any>) => void;
}

export const BillingForm = ({ data, onBillChange }: BillingFormProps) => {
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const initialBillItem: BillItemType = {
    id: generateRandomId(),
    product: { id: "", name: "", sku: "" },
    netQuantity: 0,
    totalPrice: 0,
    totalProfit: 0,
    stockUnit: "",
  };

  const initialCalculations = {
    subTotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    paidAmount: 0,
    dueAmount: 0,
    totalProfit: 0,
    roundupTotal: false,
  };

  const [items, setItems] = useState<BillItemType[]>([initialBillItem]);
  const [calculations, setCalculations] = useState(initialCalculations);
  const [discountRate, setDiscountRate] = useState("");

  useEffect(() => {
    if (data?.items) setItems(data.items);
    if (data?.calculations) setCalculations(data.calculations);
    if (storeSettings?.roundupInvoiceTotal) {
      setCalculations((p) => ({
        ...p,
        roundupTotal: storeSettings.roundupInvoiceTotal || false,
      }));
    }
  }, [data, storeSettings]);

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
    const subTotal = roundToDecimal(
      items.reduce((sum, item) => sum + item.totalPrice, 0),
    );
    const subTotalProfit = items.reduce(
      (sum, item) => sum + item.totalProfit,
      0,
    );
    const tax = 0;
    const discountAmount = roundToDecimal(
      (Number(discountRate) * subTotal) / 100,
    );
    let total = roundToDecimal(subTotal + tax - Number(discountAmount));

    if (calculations.roundupTotal) total = Math.round(total);

    setCalculations((p) => ({
      ...p,
      subTotal,
      taxAmount: tax,
      total,
      discountAmount,
      paidAmount: total,
      dueAmount: 0,
      totalProfit: subTotalProfit - discountAmount,
    }));
  }, [items, discountRate, calculations.roundupTotal]);

  useEffect(() => {
    const filteredItems = items.filter((e) => e.product.id != "");
    onBillChange({
      items: filteredItems,
      calculations,
    });
  }, [items, calculations]);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-gray-900">Items</Label>
          <Button
            onClick={addItem}
            variant="outline"
            className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
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
                  Price (₹)
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
              onChange={(e) => setDiscountRate(e)}
              value={discountRate}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="round-total" className="mb-0">
              Roundup total
            </Label>
            <ToggleButton
              id="round-total"
              isActive={calculations.roundupTotal}
              onChange={(e) =>
                setCalculations((p) => ({ ...p, roundupTotal: e }))
              }
            />
          </div>
        </div>

        <div className="w-80">
          <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">₹{calculations.subTotal}</span>
            </div>

            <ConditionalDiv
              condition={storeSettings?.defaultTaxRate}
              className="flex items-center justify-between"
            >
              <span className="text-gray-600">
                Tax ({storeSettings?.defaultTaxRate}%)
              </span>
              <span className="text-gray-900">₹0</span>
            </ConditionalDiv>

            <ConditionalDiv
              condition={calculations.discountAmount}
              className="flex items-center justify-between"
            >
              <span className="text-gray-600">
                Discount (
                <span className="text-green-600">{discountRate}%</span>)
              </span>
              <span className="text-green-600">
                - ₹{calculations.discountAmount}
              </span>
            </ConditionalDiv>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">₹{calculations.total}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Paid Amount</span>
              <Input
                type="number"
                placeholder="0.00"
                className="w-32 text-right"
                value={calculations.paidAmount}
                onChange={(e) =>
                  setCalculations((p) => ({
                    ...p,
                    paidAmount: Number(e),
                    dueAmount: p.total - Number(e),
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-900">Due Amount</span>
              <span className="text-gray-900">₹{calculations.dueAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
