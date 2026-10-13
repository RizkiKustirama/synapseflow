import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-neon/20 text-neon border border-neon/40",
        processing:
          "bg-badge-processing/20 text-lime-400 border border-badge-processing/40",
        done:
          "bg-badge-done/20 text-amber-400 border border-badge-done/40",
        pending:
          "bg-badge-pending text-foreground/80 border border-card-border",
        outline:
          "border border-card-border text-foreground",
        destructive:
          "bg-red-500/20 text-red-400 border border-red-500/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
