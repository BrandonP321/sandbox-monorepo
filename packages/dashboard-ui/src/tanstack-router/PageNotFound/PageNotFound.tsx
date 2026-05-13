import type { ReactNode } from "react";

import {
  ResourceNotFound,
  type ResourceNotFoundProps
} from "../../components/ResourceNotFound";
import { ButtonLink, type ButtonLinkProps } from "../ButtonLink";

type PageNotFoundHomePath = NonNullable<ButtonLinkProps["to"]>;

type PageNotFoundProps = Omit<ResourceNotFoundProps, "actions"> & {
  homeLabel?: ReactNode;
  homePath?: PageNotFoundHomePath;
};

function PageNotFound({
  homeLabel = "Go back home",
  homePath = "/",
  description = "Sorry, we couldn't find the page you're looking for.",
  eyebrow = "404",
  title = "Page not found",
  ...resourceNotFoundProps
}: PageNotFoundProps) {
  return (
    <ResourceNotFound
      {...resourceNotFoundProps}
      actions={<ButtonLink to={homePath}>{homeLabel}</ButtonLink>}
      description={description}
      eyebrow={eyebrow}
      title={title}
    />
  );
}

export { PageNotFound, type PageNotFoundProps };
