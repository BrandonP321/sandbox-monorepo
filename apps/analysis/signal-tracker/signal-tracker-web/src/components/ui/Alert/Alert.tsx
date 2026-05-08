import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon
} from "lucide-react";
import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "grid grid-cols-[auto_1fr] gap-x-3 rounded-md border p-4 text-sm",
  {
    variants: {
      variant: {
        danger: "border-danger/40 bg-danger/5 text-foreground",
        info: "border-info/30 bg-info/5 text-foreground",
        success: "border-success/30 bg-success/5 text-foreground",
        warning: "border-warning/30 bg-warning/5 text-foreground"
      }
    },
    defaultVariants: {
      variant: "info"
    }
  }
);

const alertIconVariants = cva("mt-0.5 size-4 shrink-0", {
  variants: {
    variant: {
      danger: "text-danger",
      info: "text-info-foreground",
      success: "text-success-foreground",
      warning: "text-warning-foreground"
    }
  },
  defaultVariants: {
    variant: "info"
  }
});

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const alertIconByVariant = {
  danger: CircleAlert,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert
} satisfies Record<AlertVariant, LucideIcon>;

type AlertNativeProps = Pick<React.ComponentProps<"div">, "className" | "role">;

type AlertProps = AlertNativeProps & {
  actions?: ReactNode;
  children: ReactNode;
  title?: ReactNode;
  variant?: AlertVariant;
};

function Alert({
  actions,
  children,
  className,
  role = "alert",
  title,
  variant = "info",
  ...alertProps
}: AlertProps) {
  const Icon = alertIconByVariant[variant];

  return (
    <div
      {...alertProps}
      data-slot="alert"
      role={role}
      className={cn(alertVariants({ variant, className }))}
    >
      <Icon
        aria-hidden="true"
        data-slot="alert-icon"
        className={alertIconVariants({ variant })}
      />
      <div className="min-w-0">
        {title ? (
          <p data-slot="alert-title" className="font-medium">
            {title}
          </p>
        ) : null}
        <div
          data-slot="alert-content"
          className={cn(title ? "text-muted-foreground mt-1" : undefined)}
        >
          {children}
        </div>
      </div>
      {actions ? (
        <div
          data-slot="alert-actions"
          className="col-start-2 mt-3 flex items-center gap-2"
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export { Alert, type AlertProps };
