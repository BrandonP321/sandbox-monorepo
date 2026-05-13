import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import type * as React from "react";

import { cn } from "@repo/dashboard-ui";

const DEFAULT_MAX_BREADCRUMB_LENGTH = 32;
const TRUNCATION_MARK = "...";

type BreadcrumbsNativeProps = Pick<React.ComponentProps<"nav">, "className">;

type BreadcrumbsItem = {
  icon?: React.ReactNode;
  id: string;
  params?: Record<string, string | undefined>;
  title: string;
  to: string;
};

type BreadcrumbsProps = BreadcrumbsNativeProps & {
  items: readonly BreadcrumbsItem[];
  label?: string;
  maxBreadcrumbLength?: number;
};

function Breadcrumbs({
  className,
  items,
  label = "Breadcrumbs",
  maxBreadcrumbLength = DEFAULT_MAX_BREADCRUMB_LENGTH
}: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={label}
      data-slot="breadcrumbs"
      className={cn("min-w-0 flex-1 [container-type:inline-size]", className)}
    >
      <ol className="flex min-w-0 list-none items-center p-0">
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          const shouldCollapseOnNarrowContainers =
            items.length > 2 && index > 0 && !isLastItem;

          return (
            <Fragment key={item.id}>
              {index === 1 && items.length > 2 ? (
                <BreadcrumbsCollapsedItem />
              ) : null}
              <BreadcrumbsListItem
                className={cn(
                  shouldCollapseOnNarrowContainers &&
                    "hidden [@container(min-width:32rem)]:flex"
                )}
                index={index}
                isCurrent={isLastItem}
                item={item}
                maxBreadcrumbLength={maxBreadcrumbLength}
              />
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

function BreadcrumbsListItem({
  className,
  index,
  isCurrent,
  item,
  maxBreadcrumbLength
}: {
  className?: string;
  index: number;
  isCurrent: boolean;
  item: BreadcrumbsItem;
  maxBreadcrumbLength: number;
}) {
  return (
    <li
      data-slot="breadcrumbs-item"
      className={cn(
        "flex min-w-0 items-center",
        isCurrent ? "flex-1" : "shrink-0",
        className
      )}
    >
      {index > 0 ? <BreadcrumbsSeparator /> : null}
      <BreadcrumbsLink
        isCurrent={isCurrent}
        item={item}
        maxBreadcrumbLength={maxBreadcrumbLength}
      />
    </li>
  );
}

function BreadcrumbsLink({
  isCurrent,
  item,
  maxBreadcrumbLength
}: {
  isCurrent: boolean;
  item: BreadcrumbsItem;
  maxBreadcrumbLength: number;
}) {
  const displayTitle = truncateBreadcrumbTitle(item.title, maxBreadcrumbLength);
  const isTruncated = displayTitle !== item.title;
  const showIcon = isHomeBreadcrumb(item) && Boolean(item.icon);
  const showText = !showIcon;
  const linkProps = {
    "aria-current": isCurrent ? "page" : undefined,
    "aria-label": showIcon || isTruncated ? item.title : undefined,
    children: (
      <>
        {showIcon ? (
          <span
            aria-hidden="true"
            className="shrink-0 text-current [&>svg]:size-4"
          >
            {item.icon}
          </span>
        ) : null}
        {showText ? <span className="truncate">{displayTitle}</span> : null}
      </>
    ),
    className: cn(
      "text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex min-w-0 items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium leading-5 outline-none transition-[color,box-shadow] focus-visible:ring-[3px]",
      isCurrent ? "max-w-full" : "max-w-[14rem]",
      isCurrent && "text-foreground"
    ),
    params: item.params,
    preload: "intent",
    title: isTruncated ? item.title : undefined,
    to: item.to
  } as const;

  return <Link {...linkProps} />;
}

function isHomeBreadcrumb(item: BreadcrumbsItem) {
  return item.id === "home" || item.to === "/";
}

function BreadcrumbsCollapsedItem() {
  return (
    <li
      aria-hidden="true"
      data-slot="breadcrumbs-collapsed-ellipsis"
      className="flex items-center [@container(min-width:32rem)]:hidden"
    >
      <BreadcrumbsSeparator />
      <span className="text-muted-foreground rounded-md px-1 py-1 text-sm font-medium leading-5">
        {TRUNCATION_MARK}
      </span>
    </li>
  );
}

function BreadcrumbsSeparator() {
  return (
    <span
      aria-hidden="true"
      className="text-muted-foreground/55 mx-2 shrink-0 select-none text-sm leading-5"
    >
      /
    </span>
  );
}

function truncateBreadcrumbTitle(title: string, maxLength: number) {
  if (title.length <= maxLength) {
    return title;
  }

  if (maxLength <= TRUNCATION_MARK.length) {
    return title.slice(0, Math.max(0, maxLength));
  }

  return `${title
    .slice(0, maxLength - TRUNCATION_MARK.length)
    .trimEnd()}${TRUNCATION_MARK}`;
}

export { Breadcrumbs, type BreadcrumbsItem, type BreadcrumbsProps };
