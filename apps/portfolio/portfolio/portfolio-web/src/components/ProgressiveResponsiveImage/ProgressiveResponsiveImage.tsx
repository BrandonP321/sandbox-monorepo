import { useEffect, useState } from "react";
import type * as React from "react";

type ProgressiveResponsiveImageSource = {
  lowResSrc: string;
  media?: string;
  src: string;
};

type ProgressiveResponsiveImageLoader = (src: string) => Promise<void>;

type ProgressiveResponsiveImageNativeProps = Pick<
  React.ComponentProps<"img">,
  "alt" | "className" | "decoding" | "loading"
>;

type ProgressiveResponsiveImageProps = ProgressiveResponsiveImageNativeProps & {
  dataSlot?: string;
  loadImage?: ProgressiveResponsiveImageLoader;
  sources: readonly [
    ProgressiveResponsiveImageSource,
    ...ProgressiveResponsiveImageSource[]
  ];
};

function defaultLoadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const decodePromise = image.decode?.();

      if (decodePromise) {
        decodePromise.then(resolve).catch(resolve);
        return;
      }

      resolve();
    };
    image.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    image.src = src;
  });
}

function getMatchingSource(
  sources: ProgressiveResponsiveImageProps["sources"]
) {
  const fallbackSource = sources.find((source) => !source.media) ?? sources[0];

  if (typeof window === "undefined" || !window.matchMedia) {
    return fallbackSource;
  }

  return (
    sources.find(
      (source) => source.media && window.matchMedia(source.media).matches
    ) ?? fallbackSource
  );
}

function ProgressiveResponsiveImage({
  className,
  dataSlot,
  loadImage = defaultLoadImage,
  sources,
  ...imageProps
}: ProgressiveResponsiveImageProps) {
  const [selectedSource, setSelectedSource] = useState(() =>
    getMatchingSource(sources)
  );
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSource(getMatchingSource(sources));

    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQueryLists = sources
      .map((source) =>
        source.media ? window.matchMedia(source.media) : undefined
      )
      .filter((queryList): queryList is MediaQueryList => Boolean(queryList));

    const updateSelectedSource = () => {
      setSelectedSource(getMatchingSource(sources));
    };

    mediaQueryLists.forEach((queryList) => {
      queryList.addEventListener("change", updateSelectedSource);
    });

    return () => {
      mediaQueryLists.forEach((queryList) => {
        queryList.removeEventListener("change", updateSelectedSource);
      });
    };
  }, [sources]);

  useEffect(() => {
    let isCurrent = true;

    setLoadedSrc(null);
    loadImage(selectedSource.src)
      .then(() => {
        if (isCurrent) {
          setLoadedSrc(selectedSource.src);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setLoadedSrc(null);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [loadImage, selectedSource.src]);

  const isFullResLoaded = loadedSrc === selectedSource.src;

  return (
    <img
      {...imageProps}
      className={["portfolio-progressive-responsive-image", className]
        .filter(Boolean)
        .join(" ")}
      data-image-resolution={isFullResLoaded ? "full-res" : "low-res"}
      data-slot={dataSlot}
      src={isFullResLoaded ? selectedSource.src : selectedSource.lowResSrc}
    />
  );
}

export {
  ProgressiveResponsiveImage,
  type ProgressiveResponsiveImageLoader,
  type ProgressiveResponsiveImageProps,
  type ProgressiveResponsiveImageSource
};
