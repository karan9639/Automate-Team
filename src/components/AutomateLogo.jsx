const AutomateLogo = ({ small = false }) => {
  if (small) {
    return (
      <div className="flex items-center">
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient
              id="sparkGradient"
              x1="0"
              y1="0"
              x2="64"
              y2="64"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          {/* Spark/Bolt Icon */}
          <path
            d="M32 4L24 28H36L20 60L40 32H28L44 4H32Z"
            fill="url(#sparkGradient)"
            stroke="#1E40AF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient
            id="sparkGradient"
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <path
          d="M32 4L24 28H36L20 60L40 32H28L44 4H32Z"
          fill="url(#sparkGradient)"
          stroke="#1E40AF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      <div className="flex flex-col leading-tight">
        <span className="text-2xl font-black tracking-wide text-[#1E3A8A]">
          KPS
        </span>
        <span className="text-sm font-medium tracking-widest text-[#384bf8]">
          AUTOMATE
        </span>
      </div>
    </div>
  );
};

export default AutomateLogo;
