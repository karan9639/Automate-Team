import * as React from "react";
import { cn } from "../../utils/helpers"; // Ensure this path is correct

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
className={cn(
      "outline-none flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-green-500 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
