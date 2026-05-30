import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "../utils";

interface CheckboxProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked: controlledChecked,
  onChange,
  disabled = false,
  className = "",
  ...props
}) => {
  const [internalChecked, setInternalChecked] = useState(false);

  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleClick = () => {
    if (disabled) return;

    if (isControlled) {
      onChange?.(!checked);
    } else {
      setInternalChecked(!checked);
      onChange?.(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer",
        "w-5 h-5 rounded border-2 transition-all duration-200",
        "hover:border-primary",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        checked ? "bg-primary border-primary" : "bg-background border-border",
        className,
      )}
      {...props}
    >
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </button>
  );
};
