import type { ReactNode } from "react";

type GlassButtonContentProps = {
  children: ReactNode;
  icon?: ReactNode;
};

function GlassButtonContent({ children, icon }: GlassButtonContentProps) {
  return (
    <>
      {icon ? (
        <span
          aria-hidden="true"
          className="portfolio-glass-button__icon"
          data-slot="glass-button-icon"
        >
          {icon}
        </span>
      ) : null}
      <span className="portfolio-glass-button__label">{children}</span>
    </>
  );
}

export { GlassButtonContent };
