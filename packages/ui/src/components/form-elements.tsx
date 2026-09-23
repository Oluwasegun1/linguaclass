import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full rounded-[var(--r-md)] bg-surface px-3.5 py-2.5 font-sans text-[14px] text-ink transition-all duration-120 outline-none placeholder:text-muted-light",
          "border-[1.5px]",
          hasError
            ? "border-coral focus:border-coral focus:ring-[3px] focus:ring-[rgba(192,80,58,0.10)]"
            : "border-border focus:border-teal focus:ring-[3px] focus:ring-[rgba(26,107,114,0.12)]",
          disabled && "cursor-not-allowed bg-surface-2 opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          "min-h-[100px] w-full resize-y rounded-[var(--r-md)] bg-surface px-3.5 py-2.5 font-sans text-[14px] text-ink transition-all duration-120 outline-none placeholder:text-muted-light",
          "border-[1.5px]",
          hasError
            ? "border-coral focus:border-coral focus:ring-[3px] focus:ring-[rgba(192,80,58,0.10)]"
            : "border-border focus:border-teal focus:ring-[3px] focus:ring-[rgba(26,107,114,0.12)]",
          disabled && "cursor-not-allowed bg-surface-2 opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, disabled, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full cursor-pointer appearance-none rounded-[var(--r-md)] bg-surface px-3.5 py-2.5 pr-10 font-sans text-[14px] text-ink transition-all duration-120 outline-none",
            "border-[1.5px]",
            hasError
              ? "border-coral focus:border-coral focus:ring-[3px] focus:ring-[rgba(192,80,58,0.10)]"
              : "border-border focus:border-teal focus:ring-[3px] focus:ring-[rgba(26,107,114,0.12)]",
            disabled && "cursor-not-allowed bg-surface-2 opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

export interface FormFieldProps {
  id?: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={id}
          className="text-[14px] font-semibold text-ink select-none"
        >
          {label}
          {required && <span className="ml-1 text-coral">*</span>}
        </label>
        {hint && <span className="text-[12px] text-muted">{hint}</span>}
      </div>
      {children}
      {error && (
        <span className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-coral">
          <svg
            className="size-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}
