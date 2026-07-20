"use client";

import React, { useState } from "react";
import { cn } from "../utils";
import { Eye, EyeOff, OctagonAlert } from "lucide-react";

export interface InputType extends Omit<
  React.ComponentProps<"input">,
  "onChange"
> {
  onChange?: (e: string) => void;
  isInvalid?: boolean;
  icon?: React.ReactElement;
  /** When provided, renders a red error message below the input */
  errorMessage?: string;
}

export const Input = ({
  className,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  isInvalid = false,
  icon,
  errorMessage,
  ...props
}: InputType) => {
  const [showPassword, setShowPassword] = useState(false);
  const isTypePassword = type === "password";
  const hasError = isInvalid || !!errorMessage;
  return (
    <div className="relative group w-full">
      {icon && (
        <div
          className={cn(
            "w-fit h-fit absolute left-3 top-2.5 flex items-center justify-center",
            "text-gray-500! group-focus-within:text-primary!",
          )}
        >
          {icon}
        </div>
      )}
      <input
        id={id}
        type={showPassword ? "text" : type}
        placeholder={placeholder || ""}
        value={value}
        className={cn(
          "w-full pl-3 pr-4 py-1.5 border border-gray-300 rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200",
          hasError && "border-red-300 focus:ring-red-200 pr-10",
          isTypePassword && "pr-10",
          icon && "pl-10",
          disabled && "bg-gray-100 cursor-not-allowed",
          className,
        )}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        {...props}
      />
      {isTypePassword && (
        <button
          type="button"
          onClick={(e) => {
            setShowPassword(!showPassword);
          }}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
      {hasError && (
        <div className="absolute right-3 top-2.5">
          <OctagonAlert className="w-5 h-5 text-red-300" />
        </div>
      )}
      {errorMessage && (
        <p className="text-red-400 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
};
