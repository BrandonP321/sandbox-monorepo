import type { ReactNode } from "react";
import type * as React from "react";

type ContentHeaderNativeProps = Pick<React.ComponentProps<"div">, "className">;

type ContentHeaderActionsAlignment = "top" | "bottom";

type ContentHeaderHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type ContentHeaderProps = ContentHeaderNativeProps & {
  actions?: ReactNode;
  alignActions?: ContentHeaderActionsAlignment;
  description?: ReactNode;
  headingLevel?: ContentHeaderHeadingLevel;
  title: ReactNode;
};

function ContentHeader({
  actions,
  alignActions = "top",
  className,
  description,
  headingLevel = 1,
  title
}: ContentHeaderProps) {
  return (
    <div
      className={["portfolio-content-header", className]
        .concat(actions ? "portfolio-content-header--has-actions" : [])
        .filter(Boolean)
        .join(" ")}
      data-slot="content-header"
    >
      <div className="portfolio-content-header__body">
        <ContentHeaderHeading headingLevel={headingLevel}>
          {title}
        </ContentHeaderHeading>
        {description ? (
          <p
            className="portfolio-content-header__description"
            data-slot="content-header-description"
          >
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div
          className={[
            "portfolio-content-header__actions",
            `portfolio-content-header__actions--${alignActions}`
          ].join(" ")}
          data-slot="content-header-actions"
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}

function ContentHeaderHeading({
  children,
  headingLevel
}: Pick<React.ComponentProps<"h1">, "children"> & {
  headingLevel: ContentHeaderHeadingLevel;
}) {
  const className = "portfolio-content-header__heading";

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
  type ContentHeaderActionsAlignment,
  type ContentHeaderHeadingLevel,
  type ContentHeaderProps
};
