export function Card({ className = "", children, hover = false, ...props }) {
  return (
    <div
      className={`
        rounded-2xl bg-surface border border-border shadow-soft
        transition-all duration-250
        ${hover ? "hover:shadow-glass hover:-translate-y-0.5" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`px-6 py-4 border-b border-border ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div className={`px-6 py-4 border-t border-border flex items-center gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
