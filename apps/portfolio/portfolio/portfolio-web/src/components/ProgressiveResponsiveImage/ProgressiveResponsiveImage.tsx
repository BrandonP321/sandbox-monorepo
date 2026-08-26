import { ProgressiveResponsiveImage as BaseProgressiveResponsiveImage } from "@repo/ui-base";
import type {
  ProgressiveResponsiveImageLoader,
  ProgressiveResponsiveImageProps as BaseProgressiveResponsiveImageProps,
  ProgressiveResponsiveImageSource
} from "@repo/ui-base";

type ProgressiveResponsiveImageProps = BaseProgressiveResponsiveImageProps & {
  dataSlot?: string;
};

function ProgressiveResponsiveImage({
  className,
  dataSlot,
  ...imageProps
}: ProgressiveResponsiveImageProps) {
  return (
    <BaseProgressiveResponsiveImage
      {...imageProps}
      className={["portfolio-progressive-responsive-image", className]
        .filter(Boolean)
        .join(" ")}
      data-slot={dataSlot}
    />
  );
}

export {
  ProgressiveResponsiveImage,
  type ProgressiveResponsiveImageLoader,
  type ProgressiveResponsiveImageProps,
  type ProgressiveResponsiveImageSource
};
