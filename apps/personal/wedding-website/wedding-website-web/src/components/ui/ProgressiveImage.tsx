import { useMemo } from "react";

import { ProgressiveResponsiveImage } from "@repo/ui-base";
import type { ProgressiveResponsiveImageProps } from "@repo/ui-base";

type ProgressiveImageProps = Omit<
  ProgressiveResponsiveImageProps,
  "sources"
> & {
  previewSrc?: string;
  src: string;
};

function ProgressiveImage({
  className,
  previewSrc,
  src,
  ...imageProps
}: ProgressiveImageProps) {
  const sources = useMemo(
    () =>
      [
        {
          ...(previewSrc === undefined ? {} : { lowResSrc: previewSrc }),
          src
        }
      ] as const,
    [previewSrc, src]
  );

  return (
    <ProgressiveResponsiveImage
      {...imageProps}
      className={["wedding-progressive-image", className]
        .filter(Boolean)
        .join(" ")}
      sources={sources}
    />
  );
}

export { ProgressiveImage, type ProgressiveImageProps };
