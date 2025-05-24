const EmptyState = ({ icon, title, description, className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default EmptyState;
