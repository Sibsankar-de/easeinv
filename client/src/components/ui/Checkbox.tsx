import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked: controlledChecked,
    onChange,
    disabled = false,
    className = '',
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
            className={`
        relative inline-flex items-center justify-center
        w-5 h-5 rounded border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked
                    ? 'bg-blue-600 border-blue-600 hover:bg-blue-700'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }
        ${className}
      `}
            {...props}
        >
            {checked && (
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            )}
        </button>
    );
};