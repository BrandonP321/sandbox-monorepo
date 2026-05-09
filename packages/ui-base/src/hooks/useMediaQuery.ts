import { useCallback, useSyncExternalStore } from "react";

type MediaQuerySubscriber = () => void;

type MediaQueryRegistryRecord = {
  mediaQueryList: MediaQueryList;
  subscribers: Set<MediaQuerySubscriber>;
  handleChange: () => void;
};

const mediaQueryRegistry = new Map<string, MediaQueryRegistryRecord>();

function canUseMatchMedia(): boolean {
  return (
    typeof window !== "undefined" && typeof window.matchMedia === "function"
  );
}

function getFallbackMatch(options?: { ssrMatch?: boolean }): boolean {
  return options?.ssrMatch ?? false;
}

function getMediaQuerySnapshot(query: string, fallbackMatch: boolean): boolean {
  const existingRecord = mediaQueryRegistry.get(query);

  if (existingRecord) {
    return existingRecord.mediaQueryList.matches;
  }

  if (!canUseMatchMedia()) {
    return fallbackMatch;
  }

  return window.matchMedia(query).matches;
}

function subscribeToMediaQuery(
  query: string,
  subscriber: MediaQuerySubscriber
): () => void {
  if (!canUseMatchMedia()) {
    return () => {};
  }

  let registryRecord = mediaQueryRegistry.get(query);

  if (!registryRecord) {
    const mediaQueryList = window.matchMedia(query);
    const subscribers = new Set<MediaQuerySubscriber>();

    registryRecord = {
      mediaQueryList,
      subscribers,
      handleChange: () => {
        for (const currentSubscriber of subscribers) {
          currentSubscriber();
        }
      }
    };

    mediaQueryRegistry.set(query, registryRecord);
  }

  const shouldAttachListener = registryRecord.subscribers.size === 0;
  registryRecord.subscribers.add(subscriber);

  if (shouldAttachListener) {
    registryRecord.mediaQueryList.addEventListener(
      "change",
      registryRecord.handleChange
    );
  }

  return () => {
    const currentRecord = mediaQueryRegistry.get(query);

    if (!currentRecord) {
      return;
    }

    currentRecord.subscribers.delete(subscriber);

    if (currentRecord.subscribers.size > 0) {
      return;
    }

    currentRecord.mediaQueryList.removeEventListener(
      "change",
      currentRecord.handleChange
    );
    mediaQueryRegistry.delete(query);
  };
}

export function useMediaQuery(
  query: string,
  options?: { ssrMatch?: boolean }
): boolean {
  const fallbackMatch = getFallbackMatch(options);
  const subscribe = useCallback(
    (subscriber: MediaQuerySubscriber) =>
      subscribeToMediaQuery(query, subscriber),
    [query]
  );
  const getSnapshot = useCallback(
    () => getMediaQuerySnapshot(query, fallbackMatch),
    [fallbackMatch, query]
  );
  const getServerSnapshot = useCallback(() => fallbackMatch, [fallbackMatch]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
