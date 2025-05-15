"use client";

import { createContext, useContext, useState } from "react";

const TabsContext = createContext({
  value: "",
  onValueChange: () => {},
});

const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}) => {
  const [tabValue, setTabValue] = useState(defaultValue || "");

  const contextValue = {
    value: value !== undefined ? value : tabValue,
    onValueChange: onValueChange || setTabValue,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={`w-full ${className || ""}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className, ...props }) => {
  return (
    <div
      className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className || ""}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className, ...props }) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      className={`px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
        isSelected
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      } ${className || ""}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className, ...props }) => {
  const { value: selectedValue } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      data-state={isSelected ? "active" : "inactive"}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
