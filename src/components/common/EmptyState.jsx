"use client";

const EmptyState = ({
  icon: IconProp,
  title,
  description,
  className = "",
  actionLabel,
  onAction,
}) => {
  let IconToRender = IconProp;

  // Check if IconProp is an object and has a .default property which is a function (the actual component)
  // This handles cases where ES module default exports are imported by systems expecting named exports,
  // or other module interop scenarios.
  if (
    IconProp &&
    typeof IconProp === "object" &&
    IconProp.default &&
    typeof IconProp.default === "function"
  ) {
    IconToRender = IconProp.default;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
    >
      {IconToRender && typeof IconToRender === "function" ? (
        <div className="mb-4 text-gray-400">
          <IconToRender size={48} />
        </div>
      ) : 
      // IconProp ? ( // If IconProp was provided but IconToRender is not a function, show an error or placeholder
      //   <div className="mb-4 text-red-500 text-xs">
      //     <p>(Invalid Icon)</p>
      //   </div>
      // ) : 
      null}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
