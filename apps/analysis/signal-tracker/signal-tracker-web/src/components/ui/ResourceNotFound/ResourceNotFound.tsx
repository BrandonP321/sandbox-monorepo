import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type ResourceNotFoundNativeProps = Pick<
  React.ComponentProps<"section">,
  "className"
>;

type ResourceNotFoundProps = ResourceNotFoundNativeProps & {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
};

function ResourceNotFound({
  actions,
  className,
  description = "Sorry, we couldn't find the resource you're looking for.",
  eyebrow,
  title = "Resource not found"
}: ResourceNotFoundProps) {
  return (
    <section
      data-slot="resource-not-found"
      className={cn(
        "flex min-h-[28rem] w-full items-center justify-center px-6 py-16 text-center sm:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-2xl">
        {eyebrow ? (
          <p
            data-slot="resource-not-found-eyebrow"
            className="text-primary text-base font-semibold"
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          data-slot="resource-not-found-title"
          className="text-foreground mt-4 text-5xl font-semibold sm:text-7xl"
        >
          {title}
        </h1>
        {description ? (
          <p
            data-slot="resource-not-found-description"
            className="text-muted-foreground mt-6 text-base sm:text-lg"
          >
            {description}
          </p>
        ) : null}
        {actions ? (
          <div
            data-slot="resource-not-found-actions"
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { ResourceNotFound, type ResourceNotFoundProps };
