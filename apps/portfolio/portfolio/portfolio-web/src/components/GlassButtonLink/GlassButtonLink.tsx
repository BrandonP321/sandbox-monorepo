import { useRef } from "react";
import type { ReactNode } from "react";
import type * as React from "react";

import { GlassButtonContent } from "../GlassButton/GlassButtonContent";
import {
  getGlassButtonClassName,
  type GlassButtonSize,
  type GlassButtonVariant,
  useGlassButtonAccentTracking
} from "../GlassButton/glassButtonShared";

type GlassButtonLinkNativeProps = Pick<
  React.ComponentProps<"a">,
  | "aria-label"
  | "children"
  | "className"
  | "href"
  | "onClick"
  | "rel"
  | "target"
>;

type GlassButtonLinkProps = Omit<GlassButtonLinkNativeProps, "href"> & {
  children: ReactNode;
  href: NonNullable<React.ComponentProps<"a">["href"]>;
  icon?: ReactNode;
  size?: GlassButtonSize;
  variant?: GlassButtonVariant;
};

function GlassButtonLink({
  children,
  className,
  href,
  icon,
  size = "default",
  variant = "primary",
  ...linkProps
}: GlassButtonLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useGlassButtonAccentTracking(linkRef, variant);

  return (
    <a
      {...linkProps}
      className={getGlassButtonClassName({ className, size, variant })}
      data-slot="glass-button-link"
      href={href}
      ref={linkRef}
    >
      <GlassButtonContent icon={icon}>{children}</GlassButtonContent>
    </a>
  );
}

export { GlassButtonLink, type GlassButtonLinkProps };
