import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-[var(--r-md)] border text-center font-sans font-medium transition-[background-color,border-color,opacity,box-shadow] duration-120 select-none focus-visible:outline-2 focus-visible:outline-offset-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[0.38]",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-teal text-white hover:bg-teal-dark focus-visible:outline-teal",
        secondary:
          "border-[1.5px] border-teal bg-transparent text-teal hover:bg-teal-light focus-visible:outline-teal",
        ghost:
          "border-[1.5px] border-border bg-transparent text-muted hover:bg-surface-2 hover:text-ink focus-visible:outline-muted",
        outline:
          "border-[1.5px] border-border bg-surface text-ink hover:bg-surface-2 focus-visible:outline-teal",
        amber:
          "border-transparent bg-amber text-white hover:bg-amber-dark focus-visible:outline-amber",
        danger:
          "border-[1.5px] border-coral bg-coral-light text-coral hover:bg-coral-light/80 focus-visible:outline-coral",
        suggestion:
          "border-[1.5px] border-dashed border-teal-mid bg-teal-light text-teal hover:bg-teal-mid/30 focus-visible:outline-teal",
      },
      size: {
        default: "h-10 px-5 py-3 text-[14px] leading-tight",
        sm: "h-8 px-3 py-2 text-[12px] leading-tight",
        lg: "h-12 px-6 py-4 text-[16px] leading-tight",
        icon: "size-8 p-2 text-[14px]",
        "icon-lg": "size-11 p-2.5 text-[16px]",
        "icon-circle":
          "flex size-11 items-center justify-center rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading = false, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="size-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
