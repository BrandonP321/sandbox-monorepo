import type * as React from "react";

import { cn } from "@/lib/utils";

type CardNativeProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

type CardProps = CardNativeProps;
type CardHeaderProps = CardNativeProps;
type CardContentProps = CardNativeProps;
type CardFooterProps = CardNativeProps;

function Card({ className, ...cardProps }: CardProps) {
  return (
    <div
      {...cardProps}
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground border-border rounded-lg border shadow-xs",
        className
      )}
    />
  );
}

function CardHeader({ className, ...headerProps }: CardHeaderProps) {
  return (
    <div
      {...headerProps}
      data-slot="card-header"
      className={cn("grid gap-1.5 p-4", className)}
    />
  );
}

function CardContent({ className, ...contentProps }: CardContentProps) {
  return (
    <div
      {...contentProps}
      data-slot="card-content"
      className={cn("p-4 pt-0", className)}
    />
  );
}

function CardFooter({ className, ...footerProps }: CardFooterProps) {
  return (
    <div
      {...footerProps}
      data-slot="card-footer"
      className={cn("flex items-center gap-2 p-4 pt-0", className)}
    />
  );
}

export {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  type CardContentProps,
  type CardFooterProps,
  type CardHeaderProps,
  type CardProps
};
