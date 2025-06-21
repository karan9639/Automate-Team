const AutomateLogo = ({ small = false }) => {
  if (small) {
    return (
      <div className="flex items-center">
        <img src="/favicon.webp" alt="Jasmine Logo" className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <img src="/favicon.webp" alt="Jasmine Logo" className="w-10 h-10" />

      <div className="flex flex-col leading-tight">
        <span className="text-2xl font-black tracking-wide text-[#c22d2d]">
          Jasmine
        </span>
        <span className="text-sm font-bold tracking-widest text-[#d13232]">
          AUTOMATE
        </span>
      </div>
    </div>
  );
};

export default AutomateLogo;
