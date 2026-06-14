import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "../utils";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newChecked = e.target.checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center w-5 h-5 shrink-0 select-none",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        disabled={disabled}
        className="peer absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        {...props}
      />
      <div
        className={cn(
          "flex items-center justify-center w-full h-full rounded border-2 transition-all duration-200",
          "peer-hover:border-primary",
          "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-1",
          checked ? "bg-primary border-primary" : "bg-background border-border",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
    </div>
  );
};

