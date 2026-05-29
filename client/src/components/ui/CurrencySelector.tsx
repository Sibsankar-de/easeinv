import { Select } from "./Select";
import currencies from "@/utils/currency-utils";
import { SelectType } from "@/types/SelectType";

export const CurrencySelector = ({ value, ...props }: SelectType) => {
  const options = currencies.map((e) => ({ key: e.code, value: e.code }));
  value = value || "INR";
  return (
    <Select
      {...props}
      value={value}
      options={options}
      id="currency-selector"
      dropdownClass="max-h-50"
    />
  );
};
