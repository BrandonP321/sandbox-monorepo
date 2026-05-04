import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-md border p-4 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-background text-foreground",
      destructive: "border-destructive/40 bg-destructive/5 text-foreground"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

type AlertNativeProps = Pick<React.ComponentProps<"div">, "className" | "role">;

type AlertProps = AlertNativeProps & {
  actions?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
  variant?: AlertVariant;
};

function Alert({
  actions,
  className,
  description,
  role = "alert",
  title,
  variant = "default",
  ...alertProps
}: AlertProps) {
  return (
    <div
      {...alertProps}
      data-slot="alert"
      role={role}
      className={cn(alertVariants({ variant, className }))}
    >
      <p data-slot="alert-title" className="font-medium">
        {title}
      </p>
      {description ? (
        <p data-slot="alert-description" className="text-muted-foreground mt-1">
          {description}
        </p>
      ) : null}
      {actions ? (
        <div data-slot="alert-actions" className="mt-3 flex items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export { Alert, type AlertProps };
