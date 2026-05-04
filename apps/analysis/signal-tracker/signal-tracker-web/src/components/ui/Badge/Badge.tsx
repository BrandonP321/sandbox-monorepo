import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        danger: "border-transparent bg-danger text-danger-foreground",
        outline: "border-border bg-background text-foreground"
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
