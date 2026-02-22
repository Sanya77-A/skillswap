import { useState } from "react";

export function Tooltip({ children, content, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      {...props}
    >
      {children}
      {show && content && (
        <span
          className="absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-surface-2 border border-border rounded-lg shadow-glass whitespace-nowrap -top-10 left-1/2 -translate-x-1/2 pointer-events-none"
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}
