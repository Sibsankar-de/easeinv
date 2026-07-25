"use client";

import { unitMap } from "@/constants/UnitMaps";
import { Select } from "./Select";
import { SelectOptionType, SelectType } from "@/types/SelectType";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";

type StockUnitInputType = Omit<SelectType, "options"> & {
  filters?: string[];
};

export const StockUnitInput = ({
  id,
  onChange,
  value,
  disabled,
  filters,
  ...props
}: StockUnitInputType) => {
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);

  let options: SelectOptionType[] = [
    ...unitMap,
    ...(storeSettings.customUnits || []),
  ];

  options = options.filter((e) => !filters?.includes(e.key));

  return (
    <Select
      id={id}
      options={options}
      value={value || options[0].key}
      onChange={onChange}
      disabled={disabled}
      {...props}
    />
  );
};
