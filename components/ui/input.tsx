import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helpText?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helpText, error, id, className, ...props }, ref) => {
    const inputId = id ?? `input-${label.replace(/\s+/g, "-").toLowerCase()}`;

    return (
      <label className="flex flex-col gap-2 text-sm font-medium text-foreground" htmlFor={inputId}>
        <span className="font-semibold text-foreground">{label}</span>
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "rounded-md border border-border bg-white px-4 py-2 text-base text-foreground shadow-sm outline-none transition focus:border-secondary focus:shadow-focus",
            error && "border-danger",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={helpText ? `${inputId}-help` : undefined}
          {...props}
        />
        {helpText && !error && (
          <span id={`${inputId}-help`} className="text-xs text-accent">
            {helpText}
          </span>
        )}
        {error && (
          <span className="text-xs text-danger" role="alert">
            {error}
          </span>
        )}
      </label>
    );
  }
);

Input.displayName = "Input";
