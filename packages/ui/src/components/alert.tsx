import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const alertVariants = cva(
  "flex items-start gap-3 rounded-[var(--r-md)] border p-4 text-[14px] transition-colors",
  {
    variants: {
      type: {
        info: "border-teal-mid bg-teal-light text-ink",
        success: "border-[#A5D6A7] bg-[#E8F5E9] text-ink",
        warning: "border-[#F5CDA7] bg-amber-light text-ink",
        error: "border-[#EEB0A4] bg-coral-light text-ink",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
)

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title: string
  message: string
}

export function Alert({
  className,
  type = "info",
  title,
  message,
  ...props
}: AlertProps) {
  const renderIcon = () => {
    switch (type) {
      case "info":
        return (
          <span className="mt-0.5 shrink-0 text-[16px] leading-none font-semibold text-teal select-none">
            ℹ
          </span>
        )
      case "success":
        return (
          <span className="mt-0.5 shrink-0 text-[16px] leading-none font-semibold text-[#2E7D32] select-none">
            ✓
          </span>
        )
      case "warning":
        return (
          <span className="mt-0.5 shrink-0 text-[16px] leading-none font-semibold text-amber-dark select-none">
            ⚠
          </span>
        )
      case "error":
        return (
          <span className="mt-0.5 shrink-0 text-[16px] leading-none font-semibold text-coral select-none">
            ✕
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div
      role="alert"
      className={cn(alertVariants({ type, className }))}
      {...props}
    >
      {renderIcon()}
      <div className="flex flex-col gap-0.5">
        <h5 className="leading-snug font-semibold text-ink">{title}</h5>
        <p className="leading-relaxed font-normal text-muted">{message}</p>
      </div>
    </div>
  )
}
