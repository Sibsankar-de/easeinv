import {
  useEffect,
  useRef,
  useState,
  type FC,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../utils";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
> {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: FC<CheckboxProps> = ({
  checked: controlledChecked,
  indeterminate = false,
  onChange,
  disabled = false,
  className = "",
  ...props
}) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newChecked = e.target.checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };

  const isMarked = checked || indeterminate;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center w-5 h-5 shrink-0 select-none",
        className,
      )}
    >
      <input
        ref={inputRef}
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
          isMarked
            ? "bg-primary border-primary"
            : "bg-background border-border",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {indeterminate ? (
          <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        ) : checked ? (
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        ) : null}
      </div>
    </div>
  );
};
