type BlackHoleParallaxMetrics = {
  scrollHeight: number;
  scrollY: number;
  viewportHeight: number;
};

function getBlackHoleParallaxCenterY({
  scrollHeight,
  scrollY,
  viewportHeight
}: BlackHoleParallaxMetrics) {
  const scrollableHeight = scrollHeight - viewportHeight;

  if (scrollableHeight <= 0) {
    return viewportHeight;
  }

  const progress = Math.min(Math.max(scrollY / scrollableHeight, 0), 1);

  return viewportHeight * (1 - progress);
}

export { getBlackHoleParallaxCenterY, type BlackHoleParallaxMetrics };
