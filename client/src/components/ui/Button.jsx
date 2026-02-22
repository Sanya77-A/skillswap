import { forwardRef, cloneElement, isValidElement } from "react";

const variants = {
  primary: "bg-accent hover:opacity-90 text-white shadow-soft",
  secondary: "bg-surface-2 hover:bg-surface border border-border text-text-primary",
  ghost: "hover:bg-surface text-text-primary",
  danger: "bg-danger/90 hover:bg-danger text-white",
  success: "bg-accent-2 hover:opacity-90 text-white",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-2xl",
};

const baseClass = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const Button = forwardRef(function Button(
  { className = "", variant = "primary", size = "md", children, disabled, asChild, ...props },
  ref
) {
  const combined = `${baseClass} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;
  if (asChild && isValidElement(children)) {
    return cloneElement(children, { className: combined, ...props });
  }
  return (
    <button ref={ref} disabled={disabled} className={combined} {...props}>
      {children}
    </button>
  );
});
