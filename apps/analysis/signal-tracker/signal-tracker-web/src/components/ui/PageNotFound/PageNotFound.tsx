import type { ReactNode } from "react";

import { appRoutes, type StaticAppRoutePath } from "@/routeRegistry";

import { ButtonLink } from "../ButtonLink";
import {
  ResourceNotFound,
  type ResourceNotFoundProps
} from "../ResourceNotFound";

type PageNotFoundProps = Omit<ResourceNotFoundProps, "actions"> & {
  homeLabel?: ReactNode;
  homePath?: StaticAppRoutePath;
};

function PageNotFound({
  homeLabel = "Go back home",
  homePath = appRoutes.home.path,
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
