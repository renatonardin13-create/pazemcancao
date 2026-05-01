import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-background shadow-premium-gold hover:brightness-115 hover:shadow-premium-gold hover:-translate-y-0.5 font-black",
        destructive:
          "bg-destructive text-destructive-foreground shadow-premium hover:brightness-110 hover:-translate-y-0.5",
        outline:
          "border border-border/40 bg-transparent backdrop-blur-sm shadow-premium hover:bg-gold/5 hover:border-gold/30 hover:text-gold hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-premium hover:bg-secondary/80 hover:brightness-110 hover:-translate-y-0.5",
        ghost: "hover:bg-gold/5 hover:text-gold hover:-translate-y-0.5",
        link: "text-gold underline-offset-4 hover:underline hover:brightness-110",
        premium:
          "bg-gradient-to-r from-gold to-gold/80 text-background font-black tracking-wide shadow-premium-gold hover:from-gold hover:to-gold hover:shadow-premium-gold border border-gold/30 hover:brightness-115 hover:-translate-y-0.5",
        premiumOutline:
          "border border-gold/30 bg-card/40 backdrop-blur-sm text-gold font-black tracking-wide hover:bg-gold/10 hover:border-gold/50 hover:text-gold hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="opacity-0">{children}</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }