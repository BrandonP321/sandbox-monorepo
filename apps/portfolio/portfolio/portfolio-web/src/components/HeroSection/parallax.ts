type BlackHoleParallaxMetrics = {
  scrollContainerHeight?: number;
  scrollHeight: number;
  scrollY: number;
  viewportHeight: number;
};

function getBlackHoleParallaxCenterY({
  scrollContainerHeight,
  scrollHeight,
  scrollY,
  viewportHeight
}: BlackHoleParallaxMetrics) {
  const scrollableHeight =
    scrollHeight - (scrollContainerHeight ?? viewportHeight);

  if (scrollableHeight <= 0) {
    return viewportHeight;
  }

  const progress = Math.min(Math.max(scrollY / scrollableHeight, 0), 1);

  return viewportHeight * (1 - progress);
}

export { getBlackHoleParallaxCenterY, type BlackHoleParallaxMetrics };
