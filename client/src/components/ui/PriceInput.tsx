import { Input, InputType } from "./Input";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { cn } from "../utils";

export const PriceInput = ({ ...props }: InputType) => {
  const {
    data: { currencySymbol },
  } = useSelector(selectCurrentStoreState);
  return (
    <Input
      {...props}
      type="number"
      className={cn("pl-8", props.className)}
      icon={<span className="text-lg">{currencySymbol}</span>}
    />
  );
};
