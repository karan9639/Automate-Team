const AutomateLogo = ({ small = false }) => {
  if (small) {
    return (
      <div className="flex items-center">
        <svg width="40" height="40" viewBox="0 0 120 120">
          <g transform="translate(10, 10)">
            {/* Triangle shape */}
            <path d="M60,0 L120,100 L0,100 Z" fill="#FFC107" stroke="#FF9800" strokeWidth="2" />
            {/* Arrow */}
            <path
              d="M60,20 L100,60 L80,60 L80,90 L40,90 L40,60 L20,60 Z"
              fill="#4285F4"
              stroke="#3367D6"
              strokeWidth="2"
            />
            {/* Eye */}
            <circle cx="60" cy="45" r="8" fill="#4CAF50" />
          </g>
        </svg>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <svg width="120" height="40" viewBox="0 0 240 80">
        <g transform="translate(0, 0)">
          {/* Triangle shape */}
          <path d="M30,0 L60,50 L0,50 Z" fill="#FFC107" stroke="#FF9800" strokeWidth="1" />
          {/* Arrow */}
          <path
            d="M30,10 L50,30 L40,30 L40,45 L20,45 L20,30 L10,30 Z"
            fill="#4285F4"
            stroke="#3367D6"
            strokeWidth="1"
          />
          {/* Eye */}
          <circle cx="30" cy="22" r="4" fill="#4CAF50" />
        </g>
        {/* Text */}
        <g transform="translate(70, 30)">
          <text fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#4285F4">
            AUTOMATE
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#FFC107" y="20">
            BUSINESS
          </text>
        </g>
      </svg>
    </div>
  )
}

export default AutomateLogo
