import { forwardRef } from "react";

export const Select = forwardRef(
  ({ className = "", error, label, id, options = [], placeholder, ...props }, ref) => {
    const selectId = id || props.name || label?.toLowerCase()?.replace(/\s/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-surface border border-border
            text-text-primary
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-200
            disabled:opacity-50
            ${error ? "border-danger" : ""}
            ${className}
          `}
          aria-invalid={error ? "true" : undefined}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-danger" role="alert">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
