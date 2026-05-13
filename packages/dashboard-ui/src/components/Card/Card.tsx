import type * as React from "react";

import { cn } from "../../lib/utils";

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
        "bg-card text-card-foreground border-border/80 rounded-xl border shadow-sm",
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
      className={cn("grid gap-2 p-5", className)}
    />
  );
}

function CardContent({ className, ...contentProps }: CardContentProps) {
  return (
    <div
      {...contentProps}
      data-slot="card-content"
      className={cn("p-5 pt-0", className)}
    />
  );
}

function CardFooter({ className, ...footerProps }: CardFooterProps) {
  return (
    <div
      {...footerProps}
      data-slot="card-footer"
      className={cn("flex flex-wrap items-center gap-2 p-5 pt-0", className)}
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
