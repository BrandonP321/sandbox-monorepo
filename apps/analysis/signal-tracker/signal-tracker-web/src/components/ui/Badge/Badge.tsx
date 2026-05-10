import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary",
        secondary: "border-secondary/80 bg-secondary text-secondary-foreground",
        danger: "border-danger/25 bg-danger/10 text-danger",
        info: "border-info/25 bg-info/10 text-info-foreground",
        outline: "border-border bg-card text-foreground",
        success: "border-success/25 bg-success/10 text-success-foreground",
        warning: "border-warning/30 bg-warning/10 text-warning-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

type BadgeNativeProps = Pick<
  React.ComponentProps<"span">,
  "children" | "className"
>;

type BadgeProps = BadgeNativeProps & {
  variant?: BadgeVariant;
};

function Badge({ className, variant = "default", ...badgeProps }: BadgeProps) {
  return (
    <span
      {...badgeProps}
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
    />
  );
}

export { Badge, type BadgeProps };
