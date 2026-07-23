"use client";

import { useId } from "react";
import { cn } from "../utils";
import { Input, InputType } from "./Input";
import { Select } from "./Select";
import { SelectOptionType } from "@/types/SelectType";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { convertUnit } from "@/utils/conversion";

interface StockInputType extends InputType {
  unit?: string;
  isSelect?: boolean;
  onUnitChange?: (unit: string) => void;
  options?: SelectOptionType[];
}

export const StockInput = ({
  id: propId,
  unit,
  isSelect = false,
  onUnitChange,
  options = [],
  className,
  ...props
}: StockInputType) => {
  const reactId = useId();
  const id = propId ?? reactId;

  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  const resolvedUnit = convertUnit(unit || "", storeSettings.customUnits);

  return (
    <div className="grid grid-cols-[1fr_auto] w-full">
      <Input
        id={id}
        type="number"
        className={cn(resolvedUnit && "flex-1 rounded-r-none!", className)}
        {...props}
      />
      {isSelect && options.length > 1 ? (
        <Select
          value={unit}
          onChange={onUnitChange}
          options={options}
          className={cn(
            "bg-gray-200 border border-gray-300 border-l-0 rounded-r-lg rounded-l-none",
            "h-full flex items-center px-2 min-w-0",
          )}
          disabled={props.disabled}
        />
      ) : (
        resolvedUnit && (
          <label
            htmlFor={id}
            className={cn(
              "px-3 bg-gray-200 border border-gray-300 border-l-0 rounded-r-lg",
              "h-full flex items-center justify-center text-gray-800",
            )}
          >
            {resolvedUnit}
          </label>
        )
      )}
    </div>
  );
};
