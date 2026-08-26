import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from "react";
import type * as React from "react";

type ProgressiveResponsiveImageSource = {
  lowResSrc?: string;
  media?: string;
  src: string;
};

type ProgressiveResponsiveImageLoader = (src: string) => Promise<void>;

type ProgressiveResponsiveImageProps = Omit<
  React.ComponentProps<"img">,
  "src" | "srcSet"
> & {
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

function getFallbackSourceIndex(
  sources: ProgressiveResponsiveImageProps["sources"]
) {
  const fallbackIndex = sources.findIndex((source) => !source.media);

  return fallbackIndex >= 0 ? fallbackIndex : 0;
}

function getMatchingSourceIndex(
  sources: ProgressiveResponsiveImageProps["sources"],
  mediaQueryLists: readonly MediaQueryList[]
) {
  let mediaQueryIndex = 0;

  for (const [sourceIndex, source] of sources.entries()) {
    if (!source.media) {
      continue;
    }

    if (mediaQueryLists[mediaQueryIndex]?.matches) {
      return sourceIndex;
    }

    mediaQueryIndex += 1;
  }

  return getFallbackSourceIndex(sources);
}

function canUseMatchMedia() {
  return (
    typeof window !== "undefined" && typeof window.matchMedia === "function"
  );
}

function useMatchingSourceIndex(
  sources: ProgressiveResponsiveImageProps["sources"]
) {
  const mediaQueryLists = useMemo(() => {
    if (!canUseMatchMedia()) {
      return [];
    }

    return sources.flatMap((source) =>
      source.media ? [window.matchMedia(source.media)] : []
    );
  }, [sources]);
  const subscribe = useCallback(
    (subscriber: () => void) => {
      mediaQueryLists.forEach((mediaQueryList) => {
        mediaQueryList.addEventListener("change", subscriber);
      });

      return () => {
        mediaQueryLists.forEach((mediaQueryList) => {
          mediaQueryList.removeEventListener("change", subscriber);
        });
      };
    },
    [mediaQueryLists]
  );
  const getSnapshot = useCallback(
    () => getMatchingSourceIndex(sources, mediaQueryLists),
    [mediaQueryLists, sources]
  );
  const getServerSnapshot = useCallback(
    () => getFallbackSourceIndex(sources),
    [sources]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function ProgressiveResponsiveImage({
  loadImage = defaultLoadImage,
  sources,
  ...imageProps
}: ProgressiveResponsiveImageProps) {
  const selectedSourceIndex = useMatchingSourceIndex(sources);
  const selectedSource = sources[selectedSourceIndex] ?? sources[0];
  const [loadedSources, setLoadedSources] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const hasLowResSource =
    Boolean(selectedSource.lowResSrc) &&
    selectedSource.lowResSrc !== selectedSource.src;
  const isFullResLoaded =
    !hasLowResSource || loadedSources.has(selectedSource.src);

  useEffect(() => {
    if (!hasLowResSource || loadedSources.has(selectedSource.src)) {
      return;
    }

    let isCurrent = true;

    loadImage(selectedSource.src)
      .then(() => {
        if (!isCurrent) {
          return;
        }

        setLoadedSources((currentSources) => {
          if (currentSources.has(selectedSource.src)) {
            return currentSources;
          }

          return new Set([...currentSources, selectedSource.src]);
        });
      })
      .catch(() => {
        // Keep displaying the available low-resolution source.
      });

    return () => {
      isCurrent = false;
    };
  }, [hasLowResSource, loadImage, loadedSources, selectedSource.src]);

  return (
    <img
      {...imageProps}
      data-image-resolution={isFullResLoaded ? "full-res" : "low-res"}
      src={
        isFullResLoaded
          ? selectedSource.src
          : (selectedSource.lowResSrc ?? selectedSource.src)
      }
    />
  );
}

export {
  ProgressiveResponsiveImage,
  type ProgressiveResponsiveImageLoader,
  type ProgressiveResponsiveImageProps,
  type ProgressiveResponsiveImageSource
};
