import { createLink } from "@tanstack/react-router";
import { forwardRef } from "react";

import { ButtonAnchor } from "../Button/Button";

const CreatedButtonLink = createLink(ButtonAnchor);

const ButtonLink = forwardRef<
  HTMLAnchorElement,
  Parameters<typeof CreatedButtonLink>[0]
>(function ButtonLink({ disabled, isLoading = false, ...props }, ref) {
  return (
    <CreatedButtonLink
      {...props}
      disabled={disabled || isLoading}
      isLoading={isLoading}
      ref={ref}
    />
  );
}) as typeof CreatedButtonLink;

type ButtonLinkProps = Parameters<typeof ButtonLink>[0];

export { ButtonLink, type ButtonLinkProps };
