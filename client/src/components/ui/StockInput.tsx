"use client";

import { unitMap } from "@/constants/UnitMaps";
import { cn } from "../utils";
import { Input, InputType } from "./Input";
import { SecondaryInput } from "./SecondaryInput";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { convertUnit } from "@/utils/conversion";

interface StockInputType extends InputType {
  unit?: string;
}

export const StockInput = ({ unit, ...props }: StockInputType) => {
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);
  return (
    <SecondaryInput
      field={convertUnit(unit || "", storeSettings.customUnits)}
      {...props}
    />
  );
};
