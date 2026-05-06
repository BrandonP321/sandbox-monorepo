import { cva, type VariantProps } from "class-variance-authority";
import { Globe2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { getGoogleFaviconUrl } from "@/lib/url";

const sourceIconVariants = cva(
  "text-muted-foreground inline-flex shrink-0 items-center justify-center [&>svg]:size-full",
  {
    variants: {
      size: {
        sm: "size-3.5",
        md: "size-4",
        lg: "size-5"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);

type SourceIconSize = NonNullable<
  VariantProps<typeof sourceIconVariants>["size"]
>;

type SourceIconProps = {
  className?: string;
  defaultIcon?: ReactNode;
  size?: SourceIconSize;
  url?: string;
};

function SourceIcon({
  className,
  defaultIcon,
  size = "md",
  url
}: SourceIconProps) {
  const faviconUrl = getGoogleFaviconUrl(url);
  const [failedFaviconUrl, setFailedFaviconUrl] = useState<
    string | undefined
  >();
  const iconClassName = sourceIconVariants({ size, className });

  if (faviconUrl && failedFaviconUrl !== faviconUrl) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className={iconClassName}
        onError={() => setFailedFaviconUrl(faviconUrl)}
        src={faviconUrl}
      />
    );
  }

  return (
    <span aria-hidden="true" className={iconClassName}>
      {defaultIcon ?? <Globe2 aria-hidden="true" className="size-full" />}
    </span>
  );
}

export { SourceIcon, type SourceIconProps };
