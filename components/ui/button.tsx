import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#0a0a0a] text-[#ffffff] hover:bg-[#1a1a1a] shadow-sm hover:shadow-md transition-all duration-300",
        outline:
          "border border-[#0a0a0a]/20 bg-white hover:border-[#0a0a0a] hover:bg-[#0a0a0a]/5 text-[#0a0a0a] transition-all duration-300",
        secondary:
          "bg-[#fdfaf5] text-[#0a0a0a] border border-[#d4af37]/30 hover:bg-[#f9f1e5] transition-all duration-300",
        ghost:
          "hover:bg-[#0a0a0a]/10 text-[#0a0a0a] transition-all duration-300",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-300",
        link: "text-[#0a0a0a] underline-offset-4 hover:underline",
        luxury:
          "bg-[#0a0a0a] text-[#d4af37] border border-[#d4af37]/50 hover:bg-[#1a1a1a] hover:border-[#d4af37] shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-[0.16em] font-bold",
        luxuryGold:
          "bg-gradient-to-r from-[#dfc086] via-[#d4af37] to-[#ad8a4d] text-[#0a0a0a] font-bold uppercase tracking-[0.16em] hover:brightness-105 shadow-md hover:shadow-gold-glow transition-all duration-300",
        editorialOutline:
          "border border-[#d4af37]/50 bg-transparent text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#d4af37] transition-all duration-300 uppercase tracking-[0.14em] font-semibold",
      },
      size: {
        default: "h-10 gap-2 px-4 text-xs font-semibold tracking-wider",
        xs: "h-7 gap-1 rounded-md px-2.5 text-[11px]",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-12 gap-2 px-6 text-xs font-bold tracking-[0.18em]",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
