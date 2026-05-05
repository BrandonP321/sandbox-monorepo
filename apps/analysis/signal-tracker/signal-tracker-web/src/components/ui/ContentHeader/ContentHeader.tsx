import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type ContentHeaderNativeProps = Pick<React.ComponentProps<"div">, "className">;

type ContentHeaderHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type ContentHeaderHeadingRenderProps = {
  children: ReactNode;
  className: string;
  headingLevel: ContentHeaderHeadingLevel;
};

type ContentHeaderDescriptionRenderProps = {
  children: ReactNode;
  className: string;
};

type ContentHeaderProps = ContentHeaderNativeProps & {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  headingLevel: ContentHeaderHeadingLevel;
  renderDescription?: (props: ContentHeaderDescriptionRenderProps) => ReactNode;
  renderHeading?: (props: ContentHeaderHeadingRenderProps) => ReactNode;
  title: ReactNode;
};

const headingClassNameByLevel = {
  1: "text-3xl",
  2: "text-xl",
  3: "text-lg",
  4: "text-base",
  5: "text-sm",
  6: "text-sm"
} satisfies Record<ContentHeaderHeadingLevel, string>;

function ContentHeader({
  actions,
  className,
  description,
  eyebrow,
  headingLevel,
  renderDescription,
  renderHeading,
  title
}: ContentHeaderProps) {
  const headingClassName = cn(
    "font-semibold",
    eyebrow ? "mt-1" : undefined,
    headingClassNameByLevel[headingLevel]
  );
  const descriptionClassName = "text-muted-foreground mt-1 text-sm";

  return (
    <div
      data-slot="content-header"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p
            data-slot="content-header-eyebrow"
            className="text-muted-foreground text-xs font-medium uppercase"
          >
            {eyebrow}
          </p>
        ) : null}
        {renderHeading ? (
          renderHeading({
            children: title,
            className: headingClassName,
            headingLevel
          })
        ) : (
          <ContentHeaderHeading
            className={headingClassName}
            headingLevel={headingLevel}
          >
            {title}
          </ContentHeaderHeading>
        )}
        {description ? (
          renderDescription ? (
            renderDescription({
              children: description,
              className: descriptionClassName
            })
          ) : (
            <p
              data-slot="content-header-description"
              className={descriptionClassName}
            >
              {description}
            </p>
          )
        ) : null}
      </div>

      {actions ? (
        <div
          data-slot="content-header-actions"
          className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end"
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}

function ContentHeaderHeading({
  children,
  className,
  headingLevel
}: Pick<React.ComponentProps<"h1">, "children" | "className"> & {
  headingLevel: ContentHeaderHeadingLevel;
}) {
  switch (headingLevel) {
    case 1:
      return <h1 className={className}>{children}</h1>;
    case 2:
      return <h2 className={className}>{children}</h2>;
    case 3:
      return <h3 className={className}>{children}</h3>;
    case 4:
      return <h4 className={className}>{children}</h4>;
    case 5:
      return <h5 className={className}>{children}</h5>;
    case 6:
      return <h6 className={className}>{children}</h6>;
  }
}

export {
  ContentHeader,
  type ContentHeaderDescriptionRenderProps,
  type ContentHeaderHeadingRenderProps,
  type ContentHeaderHeadingLevel,
  type ContentHeaderProps
};
