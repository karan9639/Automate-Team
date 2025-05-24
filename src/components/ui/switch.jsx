"use client";

import React, { forwardRef } from "react";
import { cn } from "../../utils/helpers";

const Switch = forwardRef(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      setIsChecked(checked || false);
    }, [checked]);

    const handleToggle = () => {
      if (disabled) return;

      const newValue = !isChecked;
      setIsChecked(newValue);

      if (onCheckedChange) {
        onCheckedChange(newValue);
      }
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        className={cn(
          "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-200",
          className
        )}
        disabled={disabled}
        onClick={handleToggle}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
          data-state={isChecked ? "checked" : "unchecked"}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
