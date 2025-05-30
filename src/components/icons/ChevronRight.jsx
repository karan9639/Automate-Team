const ChevronRight = ({ className = "", size = 24, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-chevron-right ${className}`}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export default ChevronRight
