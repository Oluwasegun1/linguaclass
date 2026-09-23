import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] leading-normal font-semibold tracking-[0.04em] transition-colors select-none",
  {
    variants: {
      variant: {
        live: "bg-[#E8F5E9] text-[#2E7D32]",
        scheduled: "bg-teal-light text-teal",
        pending: "bg-amber-light text-amber-dark",
        completed: "bg-surface-2 text-muted",
        error: "bg-coral-light text-coral",
        ai: "border border-dashed border-teal-mid bg-teal-light px-2 text-teal",
        "cefr-a": "bg-surface-2 px-2 text-muted",
        "cefr-b": "bg-teal-light px-2 text-teal",
        "cefr-c": "bg-amber-light px-2 text-amber-dark",
        learned: "bg-[#E8F5E9] text-[#2E7D32]",
        review: "bg-amber-light text-amber-dark",
        new: "bg-teal-light text-teal",
      },
    },
    defaultVariants: {
      variant: "scheduled",
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean
}

export function Badge({
  className,
  variant = "scheduled",
  showDot = true,
  children,
  ...props
}: BadgeProps) {
  const isPillOnly =
    variant === "ai" ||
    variant === "cefr-a" ||
    variant === "cefr-b" ||
    variant === "cefr-c"

  const shouldRenderDot = showDot && !isPillOnly

  const getDotClass = () => {
    switch (variant) {
      case "live":
        return "bg-[#4CAF50] animate-recording-pulse"
      case "scheduled":
      case "new":
        return "bg-teal"
      case "pending":
      case "review":
        return "bg-amber"
      case "completed":
        return "bg-muted-light"
      case "error":
        return "bg-coral"
      case "learned":
        return "bg-[#4CAF50]"
      default:
        return "bg-teal"
    }
  }

  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {shouldRenderDot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", getDotClass())}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  )
}
