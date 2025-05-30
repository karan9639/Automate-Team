const AutomateLogo = () => {
  return (
    <div className="flex items-center">
      <svg
        className="w-8 h-8 text-blue-600"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <span className="ml-2 text-xl font-bold text-gray-900">KPS</span>
    </div>
  );
};

export default AutomateLogo;
