const Card = ({ className, children, ...props }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={`p-4 border-b border-gray-200 ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 className={`text-lg font-semibold ${className || ""}`} {...props}>
      {children}
    </h3>
  )
}

const CardDescription = ({ className, children, ...props }) => {
  return (
    <p className={`text-sm text-gray-500 ${className || ""}`} {...props}>
      {children}
    </p>
  )
}

const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={`p-4 ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

const CardFooter = ({ className, children, ...props }) => {
  return (
    <div className={`p-4 border-t border-gray-200 ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
